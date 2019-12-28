variable "resource_prefix" {
  description = "Prefix for all resources"
  default = "mdb"
}

variable "s3_sse_algorithm" {
  description = "S3 bucket algorithm"
  default = "AES256"
}
