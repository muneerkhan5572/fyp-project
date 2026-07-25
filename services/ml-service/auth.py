from functools import wraps

from flask import jsonify, request

import config


def require_api_key(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if not config.API_KEY:
            return jsonify({"error": "Service is not configured with an API key."}), 500
        provided = request.headers.get("X-Internal-Api-Key", "")
        if provided != config.API_KEY:
            return jsonify({"error": "Unauthorized."}), 401
        return view(*args, **kwargs)

    return wrapped
