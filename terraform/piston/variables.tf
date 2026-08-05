variable "project_id" {
  description = "ID del proyecto de Google Cloud donde se desplegará Piston."
  type        = string
}

variable "region" {
  description = "Región principal para la infraestructura."
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Zona usada por la plantilla y el MIG zonal."
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Nombre corto del ambiente, por ejemplo dev o prod."
  type        = string
  default     = "dev"
}

variable "network_cidr" {
  description = "Rango IPv4 de la subred privada."
  type        = string
  default     = "10.10.1.0/24"
}

variable "piston_internal_ip" {
  description = "IP fija del balanceador interno. Debe pertenecer a network_cidr."
  type        = string
  default     = "10.10.1.2"
}

variable "machine_type" {
  description = "Tipo de máquina de cada backend Piston."
  type        = string
  default     = "e2-standard-2"
}

variable "min_replicas" {
  description = "Número mínimo de VMs. Use 0 para permitir apagado total por inactividad."
  type        = number
  default     = 0
}

variable "max_replicas" {
  description = "Número máximo de VMs Piston."
  type        = number
  default     = 3
}

variable "autoscaling_cpu_target" {
  description = "Uso promedio de CPU que dispara el autoscaling."
  type        = number
  default     = 0.60
}

variable "piston_port" {
  description = "Puerto HTTP de Piston."
  type        = number
  default     = 2000
}

variable "piston_git_ref" {
  description = "Branch, tag o commit del repositorio de Piston que se instalará."
  type        = string
  default     = "master"
}

variable "client_source_ranges" {
  description = "Rangos internos autorizados para invocar Piston."
  type        = list(string)
  default     = ["10.8.0.0/28", "10.10.1.0/24"]
}

variable "labels" {
  description = "Etiquetas adicionales para los recursos."
  type        = map(string)
  default     = {}
}