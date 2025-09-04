# AWS Infrastructure as Code with Terraform
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC
resource "aws_vpc" "permitpro_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "permitpro-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "permitpro_igw" {
  vpc_id = aws_vpc.permitpro_vpc.id

  tags = {
    Name = "permitpro-igw"
  }
}

# Public Subnets
resource "aws_subnet" "permitpro_public_subnet_1" {
  vpc_id                  = aws_vpc.permitpro_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true

  tags = {
    Name = "permitpro-public-subnet-1"
  }
}

resource "aws_subnet" "permitpro_public_subnet_2" {
  vpc_id                  = aws_vpc.permitpro_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "permitpro-public-subnet-2"
  }
}

# Private Subnets
resource "aws_subnet" "permitpro_private_subnet_1" {
  vpc_id            = aws_vpc.permitpro_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]

  tags = {
    Name = "permitpro-private-subnet-1"
  }
}

resource "aws_subnet" "permitpro_private_subnet_2" {
  vpc_id            = aws_vpc.permitpro_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = data.aws_availability_zones.available.names[1]

  tags = {
    Name = "permitpro-private-subnet-2"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "permitpro_public_rt" {
  vpc_id = aws_vpc.permitpro_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.permitpro_igw.id
  }

  tags = {
    Name = "permitpro-public-rt"
  }
}

# Route Table Associations
resource "aws_route_table_association" "permitpro_public_rta_1" {
  subnet_id      = aws_subnet.permitpro_public_subnet_1.id
  route_table_id = aws_route_table.permitpro_public_rt.id
}

resource "aws_route_table_association" "permitpro_public_rta_2" {
  subnet_id      = aws_subnet.permitpro_public_subnet_2.id
  route_table_id = aws_route_table.permitpro_public_rt.id
}

# Security Groups
resource "aws_security_group" "permitpro_lambda_sg" {
  name_prefix = "permitpro-lambda-"
  vpc_id      = aws_vpc.permitpro_vpc.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "permitpro-lambda-sg"
  }
}

resource "aws_security_group" "permitpro_rds_sg" {
  name_prefix = "permitpro-rds-"
  vpc_id      = aws_vpc.permitpro_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.permitpro_lambda_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "permitpro-rds-sg"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "permitpro_db_subnet_group" {
  name       = "permitpro-db-subnet-group"
  subnet_ids = [aws_subnet.permitpro_private_subnet_1.id, aws_subnet.permitpro_private_subnet_2.id]

  tags = {
    Name = "permitpro-db-subnet-group"
  }
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "permitpro_db" {
  identifier = "permitpro-db"

  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "permitpro"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.permitpro_rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.permitpro_db_subnet_group.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "permitpro-db"
  }
}

# S3 Bucket for file storage
resource "aws_s3_bucket" "permitpro_files" {
  bucket = "${var.project_name}-files-${random_string.bucket_suffix.result}"

  tags = {
    Name = "permitpro-files"
  }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

resource "aws_s3_bucket_public_access_block" "permitpro_files_pab" {
  bucket = aws_s3_bucket.permitpro_files.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "permitpro_files_cors" {
  bucket = aws_s3_bucket.permitpro_files.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "permitpro_lambda_role" {
  name = "permitpro-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "permitpro_lambda_basic" {
  role       = aws_iam_role.permitpro_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "permitpro_lambda_s3" {
  name = "permitpro-lambda-s3-policy"
  role = aws_iam_role.permitpro_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${aws_s3_bucket.permitpro_files.arn}/*"
      }
    ]
  })
}

# Outputs
output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.permitpro_vpc.id
}

output "db_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.permitpro_db.endpoint
}

output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.permitpro_files.bucket
}

output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.permitpro_lambda_role.arn
}
