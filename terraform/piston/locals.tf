locals {
  prefix = "piston-${var.environment}"

  common_labels = merge({
    application = "piston"
    environment = var.environment
    managed_by  = "terraform"
  }, var.labels)
}