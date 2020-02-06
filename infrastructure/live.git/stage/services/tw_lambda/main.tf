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
    key            = "live.git/stage/services/tw_lambda/terraform.tfstate"
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
module "tw_lambda" {
  source = "github.com/jianhan/mdb-infrastructure-modules//services/lambda?ref=v1.0.2-rc.10"
  filename = "lambda.zip"
  env_prefix = "stage"
  handler = "main.handler"
  runtime = "nodejs12.x"
  function_name = "tw_lambda"
  environment_variables = var.environment_variables
}

# ------------------------------------------------------------------------------
# DEPLOY S3
# ------------------------------------------------------------------------------
module "tw_s3" {
  source = "github.com/jianhan/mdb-infrastructure-modules//services/s3?ref=v1.0.2-rc.10"
  bucket_prefix = "tw-lambda"
}
