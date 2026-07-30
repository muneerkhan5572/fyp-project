from __future__ import annotations

from transformers import pipeline

_MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment-latest"

_pipeline = None


def _get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = pipeline("sentiment-analysis", model=_MODEL_NAME)
    return _pipeline


def score_reviews(texts: list[str]) -> list[dict]:
    if not texts:
        return []

    results = _get_pipeline()(texts, truncation=True, max_length=512)
    return [
        {"label": result["label"].lower(), "score": float(result["score"])}
        for result in results
    ]
