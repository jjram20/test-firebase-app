resource "google_compute_firewall" "health_checks" {
  name      = "${local.prefix}-allow-health-checks"
  network   = google_compute_network.piston.name
  direction = "INGRESS"

  source_ranges = [
    "35.191.0.0/16",
    "130.211.0.0/22"
  ]

  target_tags = ["piston-backend"]

  allow {
    protocol = "tcp"
    ports    = [tostring(var.piston_port)]
  }
}

resource "google_compute_firewall" "clients" {
  name      = "${local.prefix}-allow-clients"
  network   = google_compute_network.piston.name
  direction = "INGRESS"

  source_ranges = var.client_source_ranges
  target_tags   = ["piston-backend"]

  allow {
    protocol = "tcp"
    ports    = [tostring(var.piston_port)]
  }
}

resource "google_compute_firewall" "iap_ssh" {
  name      = "${local.prefix}-allow-iap-ssh"
  network   = google_compute_network.piston.name
  direction = "INGRESS"

  source_ranges = ["35.235.240.0/20"]
  target_tags   = ["piston-backend"]

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }
}