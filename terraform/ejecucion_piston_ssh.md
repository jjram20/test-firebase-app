- Obtener nombre de VM en GCP

gcloud compute instances list

- Conexión SSH (cambiar nombre instancia)

gcloud compute ssh piston-dev-... --zone us-central1-a

- Verificar ejecución Piston

curl http://127.0.0.1:2000/api/v2/runtimes

- Ejecución de código en máquina virtual

curl \
  -X POST \
  -H "Content-Type: application/json" \
  http://127.0.0.1:2000/api/v2/execute \
  -d '{
    "language": "python",
    "version": "*",
    "files": [
      {
        "name": "main.py",
        "content": "print(\"Hola desde la VM\")"
      }
    ]
  }'

# Generar imagen Docker

En carpeta donde se encuentra el Dockerfile, es decir en la carpeta piston-api

gcloud builds submit \
  --project PROJECT_ID \
  --tag us-central1-docker.pkg.dev/PROJECT_ID/piston-api/piston-api:load-test \
  ./terraform/piston-api