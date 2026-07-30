resource "google_compute_network" "piston" {
  name                    = "${local.prefix}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.required]
}

resource "google_compute_subnetwork" "piston" {
  name                     = "${local.prefix}-subnet"
  region                   = var.region
  network                  = google_compute_network.piston.id
  ip_cidr_range            = var.network_cidr
  private_ip_google_access = true
}

resource "google_compute_router" "piston" {
  name    = "${local.prefix}-router"
  region  = var.region
  network = google_compute_network.piston.id
}

resource "google_compute_router_nat" "piston" {
  name                               = "${local.prefix}-nat"
  router                             = google_compute_router.piston.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name                    = google_compute_subnetwork.piston.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"]
  }

  log_config {
    enable = true
    filter = "ERRORS_ONLY"
  }
}

resource "google_compute_address" "piston_lb" {
  name         = "${local.prefix}-lb-ip"
  region       = var.region
  subnetwork   = google_compute_subnetwork.piston.id
  address_type = "INTERNAL"
  address      = var.piston_internal_ip
}