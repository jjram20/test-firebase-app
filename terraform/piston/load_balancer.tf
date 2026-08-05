resource "google_compute_region_backend_service" "piston" {
  name                  = "${local.prefix}-backend"
  region                = var.region
  protocol              = "TCP"
  load_balancing_scheme = "INTERNAL"
  health_checks         = [google_compute_health_check.piston.id]

  backend {
    group          = google_compute_instance_group_manager.piston.instance_group
    balancing_mode = "CONNECTION"
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }
}

resource "google_compute_forwarding_rule" "piston" {
  name                  = "${local.prefix}-forwarding-rule"
  region                = var.region
  network               = google_compute_network.piston.id
  subnetwork            = google_compute_subnetwork.piston.id
  ip_address            = google_compute_address.piston_lb.id
  load_balancing_scheme = "INTERNAL"
  backend_service       = google_compute_region_backend_service.piston.id
  ip_protocol           = "TCP"
  ports                 = [tostring(var.piston_port)]
  allow_global_access   = false
}