resource "google_service_account" "piston_api" {
  project      = var.project_id
  account_id   = "${local.prefix}-api"
  display_name = "Piston API Cloud Run"
}

resource "google_cloud_run_v2_service" "piston_api" {
  project  = var.project_id
  name     = "${local.prefix}-api"
  location = var.region

  deletion_protection = false

  ingress              = "INGRESS_TRAFFIC_ALL"
  invoker_iam_disabled = false

  template {
    service_account                  = google_service_account.piston_api.email
    timeout                          = var.cloud_run_timeout
    max_instance_request_concurrency = var.cloud_run_concurrency

    scaling {
      min_instance_count = var.cloud_run_min_instances
      max_instance_count = var.cloud_run_max_instances
    }

    containers {
      image = var.piston_api_image

      ports {
        container_port = 8080
      }

      env {
        name  = "PISTON_URL"
        value = "${local.piston_internal_url}/api/v2/execute"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"

      network_interfaces {
        network    = google_compute_network.piston.name
        subnetwork = google_compute_subnetwork.piston.name
        tags       = ["piston-api"]
      }
    }
  }

  depends_on = [
    google_project_service.required["run.googleapis.com"],
    google_compute_forwarding_rule.piston
  ]
}