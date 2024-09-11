FROM python:3.9

# Install system dependencies for mysqlclient and pkg-config
RUN apt-get update && apt-get install -y \
    pkg-config \
    libmariadb-dev \
    build-essential

WORKDIR /usr/src/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run.py", "--host=0.0.0.0", "--port=8001"]
