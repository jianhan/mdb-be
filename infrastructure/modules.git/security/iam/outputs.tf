output "iam_lambda_arn" {
  value       = aws_iam_role.iam_role_lambda.arn
  description = "ARN of iam role for lambda"
}
