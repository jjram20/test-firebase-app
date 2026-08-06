locals {
  prefix = "piston-${var.environment}"

  piston_internal_url = "http://${google_compute_address.piston_lb.address}:${var.piston_port}"

  common_labels = merge({
    application = "piston"
    environment = var.environment
    managed_by  = "terraform"
  }, var.labels)
}