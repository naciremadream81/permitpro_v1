#!/bin/bash

# Deploy admin functionality to AWS Amplify
echo "🚀 Deploying Admin Dashboard to AWS Amplify..."

# Create deployment
echo "📦 Creating deployment..."
DEPLOYMENT_OUTPUT=$(aws amplify create-deployment --app-id d1g65b3ua94y8a --branch-name main)
echo "Deployment created: $DEPLOYMENT_OUTPUT"

# Extract job ID and upload URL
JOB_ID=$(echo $DEPLOYMENT_OUTPUT | jq -r '.jobId')
UPLOAD_URL=$(echo $DEPLOYMENT_OUTPUT | jq -r '.zipUploadUrl')

echo "Job ID: $JOB_ID"
echo "Upload URL: $UPLOAD_URL"

# Upload the zip file
echo "📤 Uploading frontend with admin functionality..."
curl -X PUT -T frontend-with-admin.zip "$UPLOAD_URL"

if [ $? -eq 0 ]; then
    echo "✅ Upload successful!"
    
    # Start deployment
    echo "🚀 Starting deployment..."
    aws amplify start-deployment --app-id d1g65b3ua94y8a --branch-name main --job-id $JOB_ID
    
    echo "🎉 Deployment started! Check AWS Amplify console for progress."
    echo "🌐 App URL: https://d1g65b3ua94y8a.amplifyapp.com"
else
    echo "❌ Upload failed!"
    exit 1
fi
