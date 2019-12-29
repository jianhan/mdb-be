# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# DEPLOY A LAMBDA
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# ----------------------------------------------------------------------------------------------------------------------
# REQUIRE A SPECIFIC TERRAFORM VERSION OR HIGHER
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  required_version = ">= 0.12"
  backend "s3" {
    bucket         = "mdb-state"
    key            = "live.git/stage/services/hn_lambda/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "terraform_locks"
    encrypt        = true
  }
}

# ------------------------------------------------------------------------------
# CONFIGURE AWS REGION
# ------------------------------------------------------------------------------
provider "aws" {
  region = "ap-southeast-2"
}

# ------------------------------------------------------------------------------
# DEPLOY THE LAMBDA FUNCTION
# ------------------------------------------------------------------------------
module "hn_lambda" {
  source = "../../../../modules.git/services/hn_lambda"
  filename = "lambda.zip"
  env_prefix = "stage"
  handler = "handler.handler"
  runtime = "nodejs12.x"
}
