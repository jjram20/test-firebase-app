resource "google_artifact_registry_repository" "piston_api" {
  project       = var.project_id
  location      = var.region
  repository_id = "piston-api"
  description   = "Imágenes Docker de la API intermediaria de Piston."
  format        = "DOCKER"

  labels = local.common_labels

  depends_on = [
    google_project_service.required["artifactregistry.googleapis.com"]
  ]
}