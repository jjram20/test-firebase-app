- Obtener URL

URL=$(gcloud run services describe piston-dev-api \
  --project piston-test-504014 \
  --region us-central1 \
  --format="value(status.url)")

- Probar endpoint de salud

curl "$URL/"

- Probar ejecución Piston

curl \
  -X POST \
  -H "Content-Type: application/json" \
  "$URL/" \
  -d '{
    "language": "python",
    "version": "*",
    "files": [
      {
        "name": "main.py",
        "content": "print(\"Hola desde Cloud Run\")"
      }
    ]
  }'