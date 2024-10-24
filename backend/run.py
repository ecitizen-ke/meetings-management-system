import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables from .env file
load_dotenv()


app = create_app()
PORT = os.getenv("PORT")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=PORT)
