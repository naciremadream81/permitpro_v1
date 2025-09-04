#!/bin/bash

# AWS Frontend Deployment Script
echo "🚀 Deploying PermitPro Frontend to AWS Amplify..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/../.."

# Check if .env.local file exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Creating from template..."
    cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/dev

# Environment
NODE_ENV=production
EOF
    echo "📝 Please edit .env.local file with your actual API URL before deploying."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo "❌ AWS Amplify CLI is not installed. Installing..."
    npm install -g @aws-amplify/cli
fi

# Initialize Amplify if not already done
if [ ! -d "amplify" ]; then
    echo "🔧 Initializing Amplify..."
    amplify init --yes
fi

# Add hosting
echo "🌐 Adding Amplify hosting..."
amplify add hosting --yes

# Deploy to Amplify
echo "☁️  Deploying to AWS Amplify..."
amplify publish --yes

# Get deployment URL
echo "📋 Getting deployment information..."
APP_URL=$(amplify status | grep "Hosting endpoint:" | awk '{print $3}')

echo "✅ Frontend deployed successfully!"
echo "🌐 App URL: $APP_URL"

echo "🎉 Frontend deployment complete!"
echo "📋 Next steps:"
echo "   1. Test your application at the provided URL"
echo "   2. Configure custom domain (optional)"
echo "   3. Set up monitoring and alerts"
