Verificar APIs habilitadas

gcloud services list --enabled

gcloud config set project <id_del_proyecto>

gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project=<id_del_proyecto>

Verificar o crear artifact registry

gcloud artifacts repositories describe piston-api --location=us-central1 --project=<id_del_proyecto> || gcloud artifacts repositories create piston-api --repository-format=docker --location=us-central1 --description="Imagen de piston-api" --project=<id_del_proyecto>

Permisos Cloud Build

- Otorgar permiso a Storage Object Viewer sobre el bucket <proyecto>_cloudbuild

gcloud storage buckets add-iam-policy-binding \
    "gs://${BUILD_BUCKET}" \
    --member="serviceAccount:${BUILD_SERVICE_ACCOUNT}" \
    --role="roles/storage.objectViewer" \
    --project="${PROJECT_ID}"

- Verificar cuenta de servicio utilizada por Cloud Build

gcloud builds get-default-service-account \
    --project="$PROJECT_ID"

- Verificar permisos actuales del repositorio

gcloud artifacts repositories get-iam-policy piston-api \
    --location=us-central1 \
    --project="$PROJECT_ID"

- Agregar permisos para publicar imágenes

gcloud artifacts repositories add-iam-policy-binding piston-api \
    --location="us-central1" \
    --project="$PROJECT_ID" \
    --member="serviceAccount:<cuenta_de_servicio_cloud_build>" \
    --role="roles/artifactregistry.writer"

Construir y publicar imagen

En /
gcloud builds submit --tag=us-central1-docker.pkg.dev/<id_del_proyecto>/piston-api:latest --project=<id_del_proyecto>

Deployar imagen

En terraform/piston

export NETWORK="$(terraform output -raw network_name)"
export SUBNET="$(terraform output -raw subnetwork_name)"
export PISTON_BASE_URL="$(terraform output -raw piston_internal_url)"
export PISTON_URL="${PISTON_BASE_URL}/api/v2/execute"

export PROJECT_ID="<id_del_proyecto>"
export REGION="us-central1"
export IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/piston-api/piston-api:latest"

gcloud run deploy piston-api \
  --image="$IMAGE" \
  --region="$REGION" \
  --project="$PROJECT_ID" \
  --network="$NETWORK" \
  --subnet="$SUBNET" \
  --vpc-egress=private-ranges-only \
  --set-env-vars="PISTON_URL=${PISTON_URL}" \
  --no-allow-unauthenticated \
  --min-instances=0 \
  --max-instances=1 \
  --cpu=1 \
  --memory=512Mi \
  --timeout=30 \
  --execution-environment=gen2

Verificar Piston

En VM
curl -i http://127.0.0.1:2000/api/v2/runtimes

Desde fuera
export CLOUD_RUN_URL="$(
  gcloud run services describe piston-api \
    --region="$REGION" \
    --project="$PROJECT_ID" \
    --format="value(status.url)"
)"

export TOKEN="$(gcloud auth print-identity-token)"

curl -i \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  "$CLOUD_RUN_URL/" \
  -d '{
    "language": "python",
    "version": "*",
    "files": [
      {
        "name": "main.py",
        "content": "print(\"Hola desde Piston\")"
      }
    ]
  }'

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

Verificar backend

gcloud compute backend-services get-health piston-dev-backend \
  --region="us-central1" \
  --project="$PROJECT_ID"