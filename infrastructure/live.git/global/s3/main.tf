# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# CREATE AN S3 BUCKET AND DYNAMODB TABLE TO USE AS A TERRAFORM BACKEND
# REQUIRE A SPECIFIC TERRAFORM VERSION OR HIGHER
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  required_version = ">= 0.12"
}

# ------------------------------------------------------------------------------
# CONFIGURE OUR AWS CONNECTION
# ------------------------------------------------------------------------------
provider "aws" {
  region = "ap-southeast-2"
}

# ------------------------------------------------------------------------------
# CONFIGURE LOCAL VARIABLES
# ------------------------------------------------------------------------------
locals {
  service_tier = "global"
  owner        = "Jian Han"
  provider     = "terraform"
}

# ------------------------------------------------------------------------------
# CONFIGURE TAGS
# ------------------------------------------------------------------------------
locals {
  # Common tags to be assigned to all resources
  common_tags = {
    ServiceTier = local.service_tier
    Owner       = local.owner
    Provider    = local.provider
  }
}

# ------------------------------------------------------------------------------
# CREATE S3 BUCKET FOR STATE
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "terraform_state" {
  bucket = "${var.resource_prefix}-state-bucket"
  # Enable versioning so we can see the full revision history of our
  # state files
  # This block enables versioning on the S3 bucket, so that every update to a file in the bucket
  # actually creates a new version of that file. This allows you to see older versions of the file and revert to those older versions at any time.
  versioning {
    enabled = true
  }
  # Enable server-side encryption by default
  server_side_encryption_configuration {
    rule {
      # This block turns server-side encryption on by default for all data written to
      # this S3 bucket. This ensures that your state files, and any secrets they may contain, are always encrypted on disk when stored in S3.
      # apply_server_side_encryption_by_default
      apply_server_side_encryption_by_default {
        sse_algorithm = var.s3_sse_algorithm
      }
    }
  }

  # tags
  tags = merge(
  {
    Resource = "s3"
  },
  local.common_tags)
}

# ------------------------------------------------------------------------------
# CREATE DYNAMODB TABLE FOR TERRAFORM LOCKS
# ------------------------------------------------------------------------------
resource "aws_dynamodb_table" "terraform_locks" {
  name         = "${var.resource_prefix}-terraform-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }

  # tags
  tags = merge(
  {
    Resource = "terraform locks"
  },
  local.common_tags)
}
