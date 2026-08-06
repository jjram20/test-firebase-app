output "piston_internal_ip" {
  description = "IP privada estable del balanceador de Piston."
  value       = google_compute_address.piston_lb.address
}

output "piston_internal_url" {
  description = "URL que debe consumir piston-api o Firebase Functions dentro de la VPC."
  value       = "http://${google_compute_address.piston_lb.address}:${var.piston_port}"
}

output "network_name" {
  value = google_compute_network.piston.name
}

output "subnetwork_name" {
  value = google_compute_subnetwork.piston.name
}

output "instance_group" {
  value = google_compute_instance_group_manager.piston.instance_group
}

output "piston_api_url" {
  description = "URL autenticada de Cloud Run que debe consumir Firebase Functions."
  value       = google_cloud_run_v2_service.piston_api.uri
}

output "firebase_piston_function_service_account" {
  description = "Cuenta de servicio que debe utilizar la Firebase Function executeCode."
  value       = google_service_account.firebase_piston_function.email
}