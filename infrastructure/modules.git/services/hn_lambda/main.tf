# ------------------------------------------------------------------------------
# LOAD IAM MOUDLE
# ------------------------------------------------------------------------------
module "lambda_iam" {
    source = "../../security/iam"
}

# ------------------------------------------------------------------------------
# LAMBDA FUNCTION RESOURCE
# ------------------------------------------------------------------------------
resource "aws_lambda_function" "hn" {
  filename      = var.filename
  function_name = "${var.env_prefix}_hn_function"
  role          = module.lambda_iam.iam_lambda_arn
  handler       = var.handler
  source_code_hash = filebase64sha256(var.filename)
  runtime = var.runtime
}
