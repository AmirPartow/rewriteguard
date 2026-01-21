import argparse
import sys
import os
import json
import logging
import pandas as pd
from typing import List, Dict, Any
from tqdm import tqdm
from sklearn.metrics import precision_recall_fscore_support, accuracy_score, confusion_matrix

# Determine project root to import backend modules
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))
sys.path.append(PROJECT_ROOT)

try:
    from backend.app.services.ml_service import get_detector
except ImportError:
    # Also try without backend prefix if running from root with PYTHONPATH set differently
    try:
        from app.services.ml_service import get_detector
    except ImportError as e:
        print(f"Error importing backend service: {e}")
        print(f"PYTHONPATH: {sys.path}")
        sys.exit(1)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_data(path: str, format_type: str = None) -> pd.DataFrame:
    """Load dataset from CSV or JSONL."""
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset not found at {path}")
    
    if format_type is None:
        ext = os.path.splitext(path)[1].lower()
        if ext == '.csv':
            format_type = 'csv'
        elif ext == '.jsonl':
            format_type = 'jsonl'
        else:
            raise ValueError(f"Could not infer format from extension {ext}. Please specify --format.")
    
    if format_type == 'csv':
        df = pd.read_csv(path)
    elif format_type == 'jsonl':
        df = pd.read_json(path, lines=True)
    else:
        raise ValueError("Unsupported format. Use 'csv' or 'jsonl'.")
    
    return df

def evaluate(
    data_path: str, 
    output_path: str, 
    text_col: str = 'text', 
    label_col: str = 'label',
    file_format: str = None,
    limit: int = None
):
    logger.info(f"Loading data from {data_path}")
    df = load_data(data_path, file_format)
    
    if limit:
        df = df.head(limit)
    
    # Validate columns
    if text_col not in df.columns:
        raise ValueError(f"Text column '{text_col}' not found in dataset")
    if label_col not in df.columns:
        raise ValueError(f"Label column '{label_col}' not found in dataset")
    
    # Load model
    logger.info("Loading detector model...")
    detector = get_detector()
    
    predictions = []
    ground_truth = []
    
    logger.info("Running inference...")
    
    # Mapping: The detector returns "ai" or "human". 
    # The dataset uses 0 (human) and 1 (ai).
    # We need to map detector output to 0/1 for metric calculation.
    label_map = {"human": 0, "ai": 1}
    
    skipped = 0
    
    for _, row in tqdm(df.iterrows(), total=len(df)):
        text = row[text_col]
        true_label = row[label_col]
        
        if not isinstance(text, str) or not text.strip():
            skipped += 1
            continue
            
        try:
            # Predict
            pred_label, score = detector.predict(text)
            
            # Map prediction to integer
            pred_int = label_map.get(pred_label.lower())
            
            if pred_int is None:
                logger.warning(f"Unknown label returned from detector: {pred_label}")
                skipped += 1
                continue
            
            predictions.append(pred_int)
            ground_truth.append(int(true_label))
            
        except Exception as e:
            logger.error(f"Error processing row: {e}")
            skipped += 1
    
    if skipped > 0:
        logger.warning(f"Skipped {skipped} invalid/error rows")
        
    if not predictions:
        logger.error("No valid predictions made.")
        return

    # Compute Metrics
    precision, recall, f1, support = precision_recall_fscore_support(
        ground_truth, predictions, labels=[0, 1]
    )
    
    acc = accuracy_score(ground_truth, predictions)
    tn, fp, fn, tp = confusion_matrix(ground_truth, predictions, labels=[0, 1]).ravel()
    
    # Organize results
    # We care mostly about the AI class (label=1)
    results = {
        "accuracy": float(acc),
        "precision_ai": float(precision[1]),
        "recall_ai": float(recall[1]),
        "f1_ai": float(f1[1]),
        "precision_human": float(precision[0]),
        "recall_human": float(recall[0]),
        "f1_human": float(f1[0]),
        "macro_f1": float((f1[0] + f1[1]) / 2),
        "confusion_matrix": {
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp)
        },
        "dataset_size": len(df),
        "evaluated_count": len(predictions)
    }
    
    # Print Summary
    print("\n" + "="*40)
    print(f"EVALUATION RESULTS")
    print("="*40)
    print(f"Accuracy:      {results['accuracy']:.4f}")
    print(f"Macro F1:      {results['macro_f1']:.4f}")
    print("-" * 40)
    print(f"AI Class (Positive):")
    print(f"  Precision:   {results['precision_ai']:.4f}")
    print(f"  Recall:      {results['recall_ai']:.4f}")
    print(f"  F1 Score:    {results['f1_ai']:.4f}")
    print("-" * 40)
    print(f"Human Class (Negative):")
    print(f"  Precision:   {results['precision_human']:.4f}")
    print(f"  Recall:      {results['recall_human']:.4f}")
    print(f"  F1 Score:    {results['f1_human']:.4f}")
    print("-" * 40)
    print(f"Confusion Matrix:")
    print(f"  TP: {results['confusion_matrix']['tp']}  FP: {results['confusion_matrix']['fp']}")
    print(f"  FN: {results['confusion_matrix']['fn']}  TN: {results['confusion_matrix']['tn']}")
    print("="*40 + "\n")
    
    # Save to file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(results, f, indent=2)
    logger.info(f"Results saved to {output_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate AI Detection Model")
    parser.add_argument("--data", required=True, help="Path to dataset (csv or jsonl)")
    parser.add_argument("--output", default="ml/reports/eval_report.json", help="Path to save results")
    parser.add_argument("--format", choices=["csv", "jsonl"], help="File format (auto-detected if omitted)")
    parser.add_argument("--text-col", default="text", help="Column name for text")
    parser.add_argument("--label-col", default="label", help="Column name for label (0=human, 1=ai)")
    parser.add_argument("--limit", type=int, help="Limit number of rows for testing")
    
    args = parser.parse_args()
    
    try:
        evaluate(
            args.data, 
            args.output, 
            args.text_col, 
            args.label_col, 
            args.format, 
            args.limit
        )
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        sys.exit(1)
