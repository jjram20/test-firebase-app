resource "google_service_account" "piston_vm" {
  account_id   = "${local.prefix}-vm"
  display_name = "Piston ${var.environment} VM"
  project      = var.project_id
}

resource "google_project_iam_member" "piston_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.piston_vm.email}"
}

resource "google_project_iam_member" "piston_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.piston_vm.email}"
}

resource "google_compute_instance_template" "piston" {
  name_prefix  = "${local.prefix}-template-"
  machine_type = var.machine_type
  tags         = ["piston-backend"]
  labels       = local.common_labels

  disk {
    source_image = "projects/debian-cloud/global/images/family/debian-12"
    auto_delete  = true
    boot         = true
    disk_size_gb = 30
    disk_type    = "pd-balanced"
  }

  network_interface {
    subnetwork = google_compute_subnetwork.piston.id
  }

  service_account {
    email  = google_service_account.piston_vm.email
    scopes = ["cloud-platform"]
  }

  metadata = {
    enable-oslogin = "TRUE"
  }

  metadata_startup_script = templatefile("${path.module}/scripts/startup.sh.tftpl", {
    piston_port    = var.piston_port
    piston_git_ref = var.piston_git_ref
  })

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    google_compute_router_nat.piston,
    google_project_iam_member.piston_logging,
    google_project_iam_member.piston_monitoring
  ]
}

resource "google_compute_health_check" "piston" {
  depends_on = [
    google_project_service.required["compute.googleapis.com"]
  ]

  name                = "${local.prefix}-health"
  check_interval_sec  = 10
  timeout_sec         = 5
  healthy_threshold   = 2
  unhealthy_threshold = 3

  http_health_check {
    port         = var.piston_port
    request_path = "/api/v2/runtimes"
  }
}

resource "google_compute_instance_group_manager" "piston" {
  name               = "${local.prefix}-mig"
  zone               = var.zone
  base_instance_name = "${local.prefix}-vm"
  target_size        = max(var.min_replicas, 1)

  version {
    instance_template = google_compute_instance_template.piston.id
  }

  named_port {
    name = "http"
    port = var.piston_port
  }

  auto_healing_policies {
    health_check      = google_compute_health_check.piston.id
    initial_delay_sec = 600
  }

  update_policy {
    type                  = "PROACTIVE"
    minimal_action        = "REPLACE"
    max_surge_fixed       = 1
    max_unavailable_fixed = 0
    replacement_method    = "SUBSTITUTE"
  }
}

resource "google_compute_autoscaler" "piston" {
  name   = "${local.prefix}-autoscaler"
  zone   = var.zone
  target = google_compute_instance_group_manager.piston.id

  autoscaling_policy {
    min_replicas    = var.min_replicas
    max_replicas    = var.max_replicas
    cooldown_period = 300

    cpu_utilization {
      target = var.autoscaling_cpu_target
    }
  }
}