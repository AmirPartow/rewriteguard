#!/usr/bin/env bash
# =============================================================================
# RewriteGuard — Load & Reliability Testing
# =============================================================================
# Tests /v1/detect and /v1/paraphrase endpoints for:
#   - Response time (p50, p95, p99)
#   - Error rates under load
#   - Concurrent request handling
#
# Run ON the EC2 instance:
#   chmod +x load_test.sh
#   ./load_test.sh
# =============================================================================

set -euo pipefail

API_BASE="http://localhost"
RESULTS_DIR="/tmp/loadtest_results"
mkdir -p "$RESULTS_DIR"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "================================================================"
echo "  RewriteGuard Load & Reliability Test"
echo "  $(date)"
echo "================================================================"
echo ""

# ─────────────────────────────────────────────────────────────────────
# Helper: run N concurrent requests and collect timing
# ─────────────────────────────────────────────────────────────────────
run_test() {
    local test_name="$1"
    local endpoint="$2"
    local method="$3"
    local data="$4"
    local concurrency="$5"
    local total="$6"
    local outfile="$RESULTS_DIR/${test_name}.txt"

    echo -e "${YELLOW}▶ Test: ${test_name}${NC}"
    echo "  Endpoint:    ${method} ${endpoint}"
    echo "  Concurrency: ${concurrency}"
    echo "  Total:       ${total} requests"

    > "$outfile"

    # Run requests in parallel batches
    local completed=0
    local errors=0
    local times=()

    for ((i=1; i<=total; i++)); do
        (
            if [ "$method" = "POST" ]; then
                result=$(curl -s -o /dev/null -w "%{http_code} %{time_total}" \
                    -X POST "${API_BASE}${endpoint}" \
                    -H "Content-Type: application/json" \
                    -d "$data" \
                    --connect-timeout 10 \
                    --max-time 30 2>/dev/null || echo "000 30.0")
            else
                result=$(curl -s -o /dev/null -w "%{http_code} %{time_total}" \
                    "${API_BASE}${endpoint}" \
                    --connect-timeout 10 \
                    --max-time 30 2>/dev/null || echo "000 30.0")
            fi
            echo "$result" >> "$outfile"
        ) &

        # Limit concurrency
        if (( i % concurrency == 0 )); then
            wait
        fi
    done
    wait

    # Parse results
    local total_requests=$(wc -l < "$outfile")
    local error_count=$(awk '$1 >= 400 || $1 == 0 {count++} END {print count+0}' "$outfile")
    local success_count=$((total_requests - error_count))

    # Calculate percentiles
    local sorted_times=$(awk '{print $2}' "$outfile" | sort -n)
    local p50_idx=$(( (total_requests * 50 / 100) + 1 ))
    local p95_idx=$(( (total_requests * 95 / 100) + 1 ))
    local p99_idx=$(( (total_requests * 99 / 100) + 1 ))

    local p50=$(echo "$sorted_times" | sed -n "${p50_idx}p")
    local p95=$(echo "$sorted_times" | sed -n "${p95_idx}p")
    local p99=$(echo "$sorted_times" | sed -n "${p99_idx}p")
    local avg=$(awk '{sum+=$2; count++} END {printf "%.3f", sum/count}' "$outfile")
    local min_t=$(echo "$sorted_times" | head -1)
    local max_t=$(echo "$sorted_times" | tail -1)

    # Convert to ms
    local p50_ms=$(echo "$p50 * 1000" | bc 2>/dev/null || echo "N/A")
    local p95_ms=$(echo "$p95 * 1000" | bc 2>/dev/null || echo "N/A")
    local p99_ms=$(echo "$p99 * 1000" | bc 2>/dev/null || echo "N/A")
    local avg_ms=$(echo "$avg * 1000" | bc 2>/dev/null || echo "N/A")

    local error_rate=0
    if [ "$total_requests" -gt 0 ]; then
        error_rate=$(awk "BEGIN {printf \"%.1f\", ($error_count / $total_requests) * 100}")
    fi

    # Check p95 target
    local p95_check=""
    local p95_val=$(echo "$p95_ms" | cut -d'.' -f1)
    if [ "$p95_val" -lt 500 ] 2>/dev/null; then
        p95_check="${GREEN}✅ PASS${NC}"
    else
        p95_check="${RED}❌ FAIL (>500ms)${NC}"
    fi

    echo "  ┌─────────────────────────────────────"
    echo "  │ Requests:   ${success_count}/${total_requests} OK (${error_rate}% errors)"
    echo -e "  │ p50:        ${p50_ms} ms"
    echo -e "  │ p95:        ${p95_ms} ms  ${p95_check}"
    echo -e "  │ p99:        ${p99_ms} ms"
    echo -e "  │ avg:        ${avg_ms} ms"
    echo -e "  │ min/max:    $(echo "$min_t * 1000" | bc)/$(echo "$max_t * 1000" | bc) ms"
    echo "  └─────────────────────────────────────"
    echo ""

    # Save summary
    echo "${test_name}: p50=${p50_ms}ms p95=${p95_ms}ms p99=${p99_ms}ms errors=${error_rate}%" >> "$RESULTS_DIR/summary.txt"
}

# ─────────────────────────────────────────────────────────────────────
# Pre-flight check
# ─────────────────────────────────────────────────────────────────────
echo "📡 Pre-flight: checking API is up..."
http_code=$(curl -s -o /dev/null -w "%{http_code}" "${API_BASE}/health" --connect-timeout 5 || echo "000")
if [ "$http_code" != "200" ]; then
    echo -e "${RED}❌ API is not responding (HTTP ${http_code}). Aborting.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ API is healthy${NC}"
echo ""

> "$RESULTS_DIR/summary.txt"

# ─────────────────────────────────────────────────────────────────────
# Test 1: Health endpoint (baseline)
# ─────────────────────────────────────────────────────────────────────
run_test "health_baseline" "/health" "GET" "" 5 20

# ─────────────────────────────────────────────────────────────────────
# Test 2: /v1/detect — single request warmup
# ─────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}▶ Warming up ML model (first request takes longer)...${NC}"
curl -s -X POST "${API_BASE}/v1/detect" \
    -H "Content-Type: application/json" \
    -d '{"text":"This is a warmup request to load the model into memory."}' \
    --max-time 120 > /dev/null 2>&1 || true
echo -e "${GREEN}  Model warmed up${NC}"
echo ""

# ─────────────────────────────────────────────────────────────────────
# Test 3: /v1/detect — short text (concurrency 1)
# ─────────────────────────────────────────────────────────────────────
DETECT_SHORT='{"text":"The quick brown fox jumps over the lazy dog. This is a simple test sentence."}'
run_test "detect_short_c1" "/v1/detect" "POST" "$DETECT_SHORT" 1 10

# ─────────────────────────────────────────────────────────────────────
# Test 4: /v1/detect — short text (concurrency 3)
# ─────────────────────────────────────────────────────────────────────
run_test "detect_short_c3" "/v1/detect" "POST" "$DETECT_SHORT" 3 15

# ─────────────────────────────────────────────────────────────────────
# Test 5: /v1/detect — longer text
# ─────────────────────────────────────────────────────────────────────
DETECT_LONG='{"text":"Artificial intelligence has transformed the way we interact with technology. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions that were previously impossible. Natural language processing enables computers to understand and generate human language with remarkable accuracy. Deep learning models, particularly transformer architectures, have achieved state of the art results across numerous benchmarks."}'
run_test "detect_long_c1" "/v1/detect" "POST" "$DETECT_LONG" 1 5

# ─────────────────────────────────────────────────────────────────────
# Test 6: /v1/paraphrase — short text (concurrency 1)
# ─────────────────────────────────────────────────────────────────────
PARA_SHORT='{"text":"The quick brown fox jumps over the lazy dog.","style":"formal"}'
run_test "paraphrase_short_c1" "/v1/paraphrase" "POST" "$PARA_SHORT" 1 5

# ─────────────────────────────────────────────────────────────────────
# Test 7: Mixed concurrent load
# ─────────────────────────────────────────────────────────────────────
echo -e "${YELLOW}▶ Test: mixed_concurrent${NC}"
echo "  Simulating real traffic: health + detect + paraphrase simultaneously"
{
    for i in $(seq 1 5); do
        curl -s -o /dev/null -w "health %{http_code} %{time_total}\n" "${API_BASE}/health" --max-time 10 &
    done
    for i in $(seq 1 3); do
        curl -s -o /dev/null -w "detect %{http_code} %{time_total}\n" \
            -X POST "${API_BASE}/v1/detect" \
            -H "Content-Type: application/json" \
            -d "$DETECT_SHORT" --max-time 30 &
    done
    wait
} > "$RESULTS_DIR/mixed.txt" 2>/dev/null

mixed_errors=$(awk '$2 >= 400 || $2 == 0 {count++} END {print count+0}' "$RESULTS_DIR/mixed.txt")
mixed_total=$(wc -l < "$RESULTS_DIR/mixed.txt")
echo "  Results: ${mixed_total} requests, ${mixed_errors} errors"
echo ""

# ─────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────
echo "================================================================"
echo "  LOAD TEST SUMMARY"
echo "================================================================"
cat "$RESULTS_DIR/summary.txt"
echo ""
echo "Memory usage:"
free -h | head -3
echo ""
echo "Docker container stats:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || true
echo ""
echo "================================================================"
echo "  Results saved to: $RESULTS_DIR/"
echo "================================================================"
