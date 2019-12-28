variable "function_name" {
  default = "lambda"
  description = "lambda function name"
  type = string
}

variable "handler" {
  default = "handler.handler"
  description = "lambda handler"
  type = string
}

variable "filename" {
  default = "lambda.zip"
  description = "zip file name"
  type = string
}

variable "runtime" {
  default = "nodejs8.10"
  description = "runtime"
  type = string
}
