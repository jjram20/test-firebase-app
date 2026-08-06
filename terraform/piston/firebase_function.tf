resource "google_service_account" "firebase_piston_function" {
  project = var.project_id

  account_id = "${local.prefix}-function"
  display_name = "Firebase Function caller for Piston API"

  depends_on = [
    google_project_service.required["iam.googleapis.com"]
  ]
}

resource "google_cloud_run_v2_service_iam_member" "firebase_piston_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_service.piston_api.location
  name     = google_cloud_run_v2_service.piston_api.name

  role   = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.firebase_piston_function.email}"
}