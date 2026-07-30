FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt .

RUN pip install \
    --no-cache-dir \
    --requirement requirements.txt

COPY app.py .

ENV PORT=8080

CMD exec gunicorn \
    --bind ":${PORT}" \
    --workers 2 \
    --threads 4 \
    --timeout 30 \
    app:app