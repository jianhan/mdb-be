variable "filename" {
  type = string
  description = "Lambda zip file name"
}

variable "env_prefix" {
  type = string
  description = "Environment prefix"
}

variable "handler" {
  type = string
  description = "Lambda handler"
}

variable "runtime" {
  type = string
  description = "Lambda run time"
}
