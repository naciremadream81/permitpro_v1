#!/bin/bash

# AWS Backend Deployment Script
echo "🚀 Deploying PermitPro Backend to AWS..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Serverless Framework is available
if ! npx serverless --version &> /dev/null; then
    echo "❌ Serverless Framework is not available. Installing..."
    npm install serverless
fi

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://permitpro_user:your-secure-password@your-rds-endpoint.amazonaws.com:5432/permitpro
DB_HOST=your-rds-endpoint.amazonaws.com
DB_NAME=permitpro
DB_USER=permitpro_user
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# S3 Configuration
S3_BUCKET=permitpro-files-your-unique-id

# Cognito Configuration (optional)
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_USER_POOL_CLIENT_ID=your-client-id

# AWS Configuration
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
EOF
    echo "📝 Please edit .env file with your actual values before deploying."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Deploy to AWS
echo "☁️  Deploying to AWS..."
npx serverless deploy --stage dev

# Get deployment outputs
echo "📋 Getting deployment information..."
API_URL=$(npx serverless info --stage dev | grep "endpoint:" | awk '{print $2}')
S3_BUCKET=$(npx serverless info --stage dev | grep "S3BucketName:" | awk '{print $2}')
DB_ENDPOINT=$(npx serverless info --stage dev | grep "DatabaseEndpoint:" | awk '{print $2}')

echo "✅ Backend deployed successfully!"
echo "🌐 API URL: $API_URL"
echo "🪣 S3 Bucket: $S3_BUCKET"
echo "🗄️  Database Endpoint: $DB_ENDPOINT"

# Update .env with actual values
echo "📝 Updating .env with deployment values..."
sed -i "s|DB_HOST=.*|DB_HOST=$DB_ENDPOINT|" .env
sed -i "s|S3_BUCKET=.*|S3_BUCKET=$S3_BUCKET|" .env

echo "🎉 Backend deployment complete!"
echo "📋 Next steps:"
echo "   1. Update your frontend environment variables with the API URL"
echo "   2. Run the database setup script"
echo "   3. Deploy the frontend"
