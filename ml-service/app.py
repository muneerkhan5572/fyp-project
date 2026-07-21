from flask import Flask, jsonify, request
from pydantic import ValidationError

import config
from auth import require_api_key
from forecasting import generate_forecasts
from schemas import ForecastRequest

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


if __name__ == "__main__":
    app.run(port=config.PORT, debug=True)
