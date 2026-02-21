# =============================================================================
# RewriteGuard — AWS Infrastructure (Free Tier)
# =============================================================================
# Creates a single EC2 t2.micro with Docker, ready to run the app.
# Estimated cost: $0/month (AWS Free Tier for 12 months)
# =============================================================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-west-2"
}

# ---------- SSH Key Pair ----------
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "rewriteguard" {
  key_name   = "rewriteguard-key"
  public_key = tls_private_key.ssh.public_key_openssh
}

resource "local_file" "ssh_private_key" {
  content         = tls_private_key.ssh.private_key_pem
  filename        = "${path.module}/rewriteguard-key.pem"
  file_permission = "0400"
}

# ---------- Security Group ----------
resource "aws_security_group" "rewriteguard" {
  name        = "rewriteguard-sg"
  description = "Allow SSH, HTTP, HTTPS"

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "rewriteguard-sg"
  }
}

# ---------- Get latest Amazon Linux 2023 AMI ----------
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ---------- EC2 Instance ----------
resource "aws_instance" "rewriteguard" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = "t3.micro"
  key_name               = aws_key_pair.rewriteguard.key_name
  vpc_security_group_ids = [aws_security_group.rewriteguard.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  # Install Docker, Docker Compose, create swap on first boot
  user_data = <<-EOF
    #!/bin/bash
    set -e

    # Update system
    dnf update -y

    # Install Docker and Git
    dnf install -y docker git curl
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user

    # Install Docker Compose
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    # Create 2GB swap (t2.micro only has 1GB RAM)
    dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab

    # Configure Docker log rotation
    cat > /etc/docker/daemon.json << 'DJSON'
    {
      "log-driver": "json-file",
      "log-opts": { "max-size": "10m", "max-file": "3" }
    }
    DJSON
    systemctl restart docker

    # Signal that setup is complete
    touch /home/ec2-user/.setup-complete
    echo "Setup complete!" > /home/ec2-user/setup-status.txt
  EOF

  tags = {
    Name = "rewriteguard"
  }
}

# ---------- Elastic IP ----------
resource "aws_eip" "rewriteguard" {
  instance = aws_instance.rewriteguard.id
  domain   = "vpc"

  tags = {
    Name = "rewriteguard-eip"
  }
}

# ---------- Outputs ----------
output "elastic_ip" {
  value       = aws_eip.rewriteguard.public_ip
  description = "Public IP for api.rewritguard.com DNS"
}

output "instance_id" {
  value = aws_instance.rewriteguard.id
}

output "ssh_command" {
  value       = "ssh -i ${path.module}/rewriteguard-key.pem ec2-user@${aws_eip.rewriteguard.public_ip}"
  description = "SSH command to connect to the instance"
}

output "ssh_key_path" {
  value       = local_file.ssh_private_key.filename
  description = "Path to the SSH private key"
}
