#!/bin/bash

# GCP Frontend Deployment Script
echo "🚀 Deploying PermitPro Frontend to Firebase Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Installing..."
    npm install -g firebase-tools
fi

# Check if user is authenticated
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not authenticated with Firebase. Please run 'firebase login' first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/../.."

# Check if .env.local file exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local file not found. Creating from template..."
    cat > .env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=https://your-app-engine-url.appspot.com

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

# Initialize Firebase if not already done
if [ ! -f "firebase.json" ]; then
    echo "🔧 Initializing Firebase..."
    firebase init hosting --project default
fi

# Deploy to Firebase Hosting
echo "☁️  Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Get deployment URL
echo "📋 Getting deployment information..."
APP_URL=$(firebase hosting:channel:list | grep "live" | awk '{print $2}')

echo "✅ Frontend deployed successfully!"
echo "🌐 App URL: $APP_URL"

echo "🎉 Frontend deployment complete!"
echo "📋 Next steps:"
echo "   1. Test your application at the provided URL"
echo "   2. Configure custom domain (optional)"
echo "   3. Set up monitoring and alerts"
