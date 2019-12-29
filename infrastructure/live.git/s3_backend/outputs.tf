output "terraform_state_bucket" {
  value = aws_s3_bucket.terraform_state.bucket
}

output "terraform_state_region" {
  value = aws_s3_bucket.terraform_state.region
}

output "terraform_locks" {
  value = aws_dynamodb_table.terraform_locks.name
}
