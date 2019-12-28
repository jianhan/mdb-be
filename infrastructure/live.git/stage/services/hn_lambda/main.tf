# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# DEPLOY A LAMBDA
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# ----------------------------------------------------------------------------------------------------------------------
# REQUIRE A SPECIFIC TERRAFORM VERSION OR HIGHER
# ----------------------------------------------------------------------------------------------------------------------
terraform {
  required_version = ">= 0.12"
  backend "s3" {
    # Replace this with your bucket name!
    bucket         = "mdb-state"
    key            = "live.git/stage/services/hn_lambda/terraform.tfstate"
    region         = "ap-southeast-2"
    # Replace this with your DynamoDB table name!
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
# LOAD IAM MOUDLE
# ------------------------------------------------------------------------------
module "lambda_iam" {
  source = "../../../../modules.git/security/iam"
}

# ------------------------------------------------------------------------------
# BUILD LAMBDA AND ZIP IT
# ------------------------------------------------------------------------------
resource "null_resource" "build_lambda" {
  provisioner "local-exec" {
    command = "./build_lambda.sh"
  }
}

# ------------------------------------------------------------------------------
# DEPLOY THE LAMBDA FUNCTION
# ------------------------------------------------------------------------------
resource "aws_lambda_function" "hn" {
  filename      = "lambda.zip"
  function_name = "hn_function"
  role          = module.lambda_iam.iam_lambda_arn
  handler       = "handler.handler"
  source_code_hash = filebase64sha256("lambda.zip")
  runtime = "nodejs12.x"
  depends_on = [null_resource.build_lambda]
}
