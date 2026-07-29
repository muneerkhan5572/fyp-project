from flask import Flask, jsonify, request
from pydantic import ValidationError

import config
from auth import require_api_key
from classification import classify_products
from forecasting import generate_forecasts
from schemas import ClassifyRequest, EmbedRequest, ForecastRequest, SentimentRequest
from semantic_search import embed_texts
from sentiment import score_reviews

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/forecast")
@require_api_key
def forecast():
    try:
        payload = ForecastRequest.model_validate(request.get_json(force=True, silent=False))
    except ValidationError as error:
        return jsonify({"error": "Invalid request.", "details": error.errors()}), 400

    result = generate_forecasts(payload)
    return jsonify(result)


@app.post("/embed")
@require_api_key
def embed():
    try:
        payload = EmbedRequest.model_validate(request.get_json(force=True, silent=False))
    except ValidationError as error:
        return jsonify({"error": "Invalid request.", "details": error.errors()}), 400

    vectors = embed_texts(payload.texts)
    return jsonify({"vectors": vectors})


@app.post("/classify")
@require_api_key
def classify():
    try:
        payload = ClassifyRequest.model_validate(request.get_json(force=True, silent=False))
    except ValidationError as error:
        return jsonify({"error": "Invalid request.", "details": error.errors()}), 400

    results = classify_products([product.model_dump() for product in payload.products])
    return jsonify({"results": results})


@app.post("/sentiment")
@require_api_key
def sentiment():
    try:
        payload = SentimentRequest.model_validate(request.get_json(force=True, silent=False))
    except ValidationError as error:
        return jsonify({"error": "Invalid request.", "details": error.errors()}), 400

    results = score_reviews(payload.texts)
    return jsonify({"results": results})


if __name__ == "__main__":
    app.run(port=config.PORT, debug=True)
