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
  source = "github.com/jianhan/mdb-infrastructure-modules//services/lambda?ref=v1.0.2-rc.14"
  filename = "lambda.zip"
  env_prefix = "stage"
  handler = "tw/src/main.handler"
  runtime = "nodejs12.x"
  function_name = "tw_lambda"
  environment_variables = var.environment_variables
}

# ------------------------------------------------------------------------------
# Define cloud watch event rule.
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_event_rule" "every_6_hours" {
  name = "every-6-hourse"
  description = "Fires every five minutes"
  schedule_expression = "rate(6 hours)"
}

# ------------------------------------------------------------------------------
# Define cloud watch event target.
# ------------------------------------------------------------------------------
resource "aws_cloudwatch_event_target" "every_6_hours" {
  rule = aws_cloudwatch_event_rule.every_6_hours.name
  target_id = module.tw_lambda.lambda_function_target_id
  arn = module.tw_lambda.lambda_function_arn
  input = <<DOC
  {
    "path": "./users/index",
    "body": {
      "screenNames": [
        "chenqiushi404", "realDonaldTrump", "AlboMP", "KatieAllenMP", "karenandrewsmp", "kevinandrewsmp", "bridgetarcher", "AdamBandt", "SharonBirdMP", "BroadbentMP", "ScottBuchholzMP", "Tony_Burke"
      ]
    }
  }
  DOC
}

# ------------------------------------------------------------------------------
# Setup lambda permissions with cloud watch.
# ------------------------------------------------------------------------------
resource "aws_lambda_permission" "allow_cloudwatch_to_call_lambda" {
  statement_id = "AllowExecutionFromCloudWatch"
  action = "lambda:InvokeFunction"
  function_name = module.tw_lambda.lambda_function_name
  principal = "events.amazonaws.com"
  source_arn = aws_cloudwatch_event_rule.every_6_hours.arn
}

# ------------------------------------------------------------------------------
# DEPLOY S3
# ------------------------------------------------------------------------------
module "tw_s3" {
  source = "github.com/jianhan/mdb-infrastructure-modules//services/s3?ref=v1.0.2-rc.14"
  bucket_prefix = "tw-lambda"
}
