# Evaluation Pipeline

This directory contains the tools and data for evaluating the performance of the RewriteGuard AI Detection model.

## Target Metric
**Target**: >= 85% F1-score on the AI class (label=1).

## Dataset Format
The pipeline supports `CSV` and `JSONL` formats.

### Schema
- `text` (string): The content to analyze.
- `label` (integer): 
  - `0`: Human-written
  - `1`: AI-generated

### Examples
**CSV**:
```csv
text,label
"This is human written text.",0
"As an AI language model...",1
```

**JSONL**:
```json
{"text": "This is human written text.", "label": 0}
{"text": "As an AI language model...", "label": 1}
```

## Running Evaluation

1. **Install Dependencies**:
   ```bash
   pip install -r ml/requirements.txt
   ```
   (Also ensure backend dependencies are installed or you are in the unified environment)

2. **Run Script**:
   ```bash
   python ml/scripts/evaluate.py --data ml/data/samples.csv
   ```

   **Arguments**:
   - `--data`: Path to input file (Required)
   - `--output`: Path to save JSON report (Default: `ml/reports/eval_report.json`)
   - `--limit`: Run on first N rows only (optional)

## Current Baseline
*(Run the evaluation script to generate current metrics. The base DeBERTa model is likely to perform poorly without fine-tuning on domain-specific data.)*
