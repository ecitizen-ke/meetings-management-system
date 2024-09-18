from app.migrations import run_migrations
from app import create_app
from flask_cors import CORS

app = create_app()
CORS(app)

# Run migrations within the application context
# with app.app_context():
#     run_migrations()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=8001)
