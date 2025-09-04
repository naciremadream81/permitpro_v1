#!/bin/bash

# GCP Backend Deployment Script
echo "🚀 Deploying PermitPro Backend to Google Cloud Platform..."

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK is not installed. Please install it first."
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with Google Cloud. Please run 'gcloud auth login' first."
    exit 1
fi

# Set project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No project ID set. Please run 'gcloud config set project YOUR_PROJECT_ID' first."
    exit 1
fi

echo "📋 Using project: $PROJECT_ID"

# Navigate to backend directory
cd "$(dirname "$0")/../backend"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << EOF
# Database Configuration
DB_HOST=/cloudsql/$PROJECT_ID:us-central1:permitpro-db
DB_NAME=permitpro
DB_USER=permitpro_user
DB_PASSWORD=your-secure-password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key

# Storage Configuration
STORAGE_BUCKET=permitpro-files-$PROJECT_ID
EOF
    echo "📝 Please edit .env file with your actual values before deploying."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create Cloud SQL instance if it doesn't exist
echo "🗄️  Setting up Cloud SQL instance..."
if ! gcloud sql instances describe permitpro-db --project=$PROJECT_ID &> /dev/null; then
    echo "Creating Cloud SQL instance..."
    gcloud sql instances create permitpro-db \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=us-central1 \
        --storage-type=SSD \
        --storage-size=10GB \
        --storage-auto-increase \
        --backup \
        --project=$PROJECT_ID
else
    echo "Cloud SQL instance already exists."
fi

# Create database
echo "📊 Creating database..."
gcloud sql databases create permitpro --instance=permitpro-db --project=$PROJECT_ID

# Create database user
echo "👤 Creating database user..."
gcloud sql users create permitpro_user --instance=permitpro-db --password=your-secure-password --project=$PROJECT_ID

# Create Cloud Storage bucket
echo "🪣 Creating Cloud Storage bucket..."
BUCKET_NAME="permitpro-files-$PROJECT_ID"
if ! gsutil ls gs://$BUCKET_NAME &> /dev/null; then
    gsutil mb gs://$BUCKET_NAME
    echo "Storage bucket created: $BUCKET_NAME"
else
    echo "Storage bucket already exists: $BUCKET_NAME"
fi

# Deploy to App Engine
echo "☁️  Deploying to App Engine..."
gcloud app deploy app.yaml --project=$PROJECT_ID

# Get deployment URL
echo "📋 Getting deployment information..."
APP_URL=$(gcloud app browse --project=$PROJECT_ID --no-launch-browser)

echo "✅ Backend deployed successfully!"
echo "🌐 App URL: $APP_URL"
echo "🗄️  Database: permitpro-db"
echo "🪣 Storage Bucket: $BUCKET_NAME"

echo "🎉 Backend deployment complete!"
echo "📋 Next steps:"
echo "   1. Update your frontend environment variables with the App URL"
echo "   2. Run the database setup script"
echo "   3. Deploy the frontend"
