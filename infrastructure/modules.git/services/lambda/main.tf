module "lambda_iam" {
  source = "../../security/iam"
}

resource "aws_lambda_function" "aws_lambda_function" {
  filename      = var.filename
  function_name = var.function_name
  role          = module.lambda_iam.iam_lambda_arn
  handler       = var.handler
  source_code_hash = filebase64sha256(var.filename)
  runtime = var.runtime
}
