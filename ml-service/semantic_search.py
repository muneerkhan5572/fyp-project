from __future__ import annotations

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

_MODEL_NAME = "all-MiniLM-L6-v2"
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(_MODEL_NAME)
    return _model


def search_products(products: list[dict], query: str) -> list[dict]:
    if not products:
        return []

    if not query.strip():
        return [{"sku": product["sku"], "score": 0.0} for product in products]

    model = _get_model()
    texts = [
        f"{product['name']} {product.get('category') or ''}".strip()
        for product in products
    ]
    product_embeddings = model.encode(texts)
    query_embedding = model.encode([query])

    scores = cosine_similarity(query_embedding, product_embeddings)[0]
    ranked = sorted(
        zip((product["sku"] for product in products), scores),
        key=lambda pair: pair[1],
        reverse=True,
    )
    return [{"sku": sku, "score": float(score)} for sku, score in ranked]
