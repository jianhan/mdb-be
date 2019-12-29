data "aws_iam_policy_document" "assume_role_policy" {
  version = "2012-10-17"
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]
    sid = ""
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "iam_role_lambda" {
  name = "iam_role_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}
