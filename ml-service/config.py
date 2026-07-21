import os

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.environ.get("ML_SERVICE_API_KEY", "")
PORT = int(os.environ.get("PORT", "5001"))
