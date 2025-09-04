# 🚀 PermitPro Deployment Guide

## **Overview**

This guide provides step-by-step instructions for deploying PermitPro to both **AWS Free Tier** and **Google Cloud Platform Free Tier**. Both deployments use the same codebase with platform-specific configurations.

---

## **🔧 Prerequisites**

### **Common Requirements**
- **Node.js 20+** (required for Firebase CLI compatibility)
- **Git** for version control
- **Modern web browser**

### **AWS Requirements**
- AWS Account with free tier eligibility
- AWS CLI installed and configured
- AWS credentials configured

### **GCP Requirements**
- Google Cloud Account with free tier eligibility
- Google Cloud SDK installed and configured
- Firebase CLI installed and authenticated

---

## **📋 Universal Setup Steps**

### **Step 1: Clone and Prepare**
```bash
# Clone the repository
git clone <your-repo>
cd permitpro_v1

# Fix any deployment issues
./fix-deployment.sh

# Install dependencies
npm install
```

### **Step 2: Environment Configuration**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your platform-specific settings
nano .env
```

**Required Environment Variables:**
```bash
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database"

# JWT Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="production"

# API Configuration
NEXT_PUBLIC_API_URL="https://your-api-endpoint.com/api"
VITE_API_URL="https://your-api-endpoint.com/api"
```

---

## **☁️ AWS Free Tier Deployment**

### **Architecture**
- **Frontend**: AWS Amplify (Next.js)
- **Backend**: AWS Lambda + API Gateway
- **Database**: Amazon RDS PostgreSQL
- **Storage**: Amazon S3
- **Authentication**: AWS Cognito

### **Deployment Steps**

#### **1. Configure AWS Environment**
```bash
# Add AWS-specific variables to .env
echo "AWS_ACCESS_KEY_ID=your-access-key" >> .env
echo "AWS_SECRET_ACCESS_KEY=your-secret-key" >> .env
echo "AWS_REGION=us-east-1" >> .env
echo "DATABASE_URL=postgresql://user:pass@your-rds-endpoint:5432/permitpro" >> .env
```

#### **2. Deploy Backend**
```bash
cd aws-deployment
./deploy-backend.sh
```

#### **3. Deploy Frontend**
```bash
./deploy-frontend.sh
```

#### **4. Verify Deployment**
```bash
# Test API
curl https://your-api-gateway-url.amazonaws.com/api/health

# Test Frontend
open https://your-amplify-app.amplifyapp.com
```

---

## **🔥 Google Cloud Platform Deployment**

### **Architecture**
- **Frontend**: Firebase Hosting (Next.js)
- **Backend**: Google App Engine (Express.js)
- **Database**: Cloud SQL PostgreSQL
- **Storage**: Cloud Storage
- **Authentication**: Firebase Auth

### **Deployment Steps**

#### **1. Configure GCP Environment**
```bash
# Add GCP-specific variables to .env
echo "GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json" >> .env
echo "DATABASE_URL=postgresql://user:pass@your-cloud-sql-ip:5432/permitpro" >> .env
echo "GCP_PROJECT_ID=your-project-id" >> .env
```

#### **2. Deploy Backend**
```bash
cd gcp-deployment
./deploy-backend.sh
```

#### **3. Deploy Frontend**
```bash
./deploy-frontend.sh
```

#### **4. Verify Deployment**
```bash
# Test API
curl https://your-project-id.appspot.com/api/health

# Test Frontend
open https://your-project-id.web.app
```

---

## **🔄 Development vs Production**

### **Development Setup**
```bash
# Start development environment
npm run start:all

# Access points:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# Database: http://localhost:5432 (if running locally)
```

### **Production Deployment**
- Use the platform-specific deployment scripts
- Ensure all environment variables are set
- Run database migrations before deployment
- Test all endpoints after deployment

---

## **📊 Cost Comparison**

| Service | AWS Free Tier | GCP Free Tier |
|---------|---------------|---------------|
| **Frontend Hosting** | Amplify (1000 build min/month) | Firebase Hosting (10GB storage) |
| **Backend** | Lambda (1M requests/month) | App Engine (2M requests/month) |
| **Database** | RDS (750 hours/month) | Cloud SQL (1 instance, 1GB RAM) |
| **Storage** | S3 (5GB storage) | Cloud Storage (5GB storage) |
| **Authentication** | Cognito (50K users/month) | Firebase Auth (unlimited users) |
| **Monthly Cost** | **$0** | **$0** |

---

## **🛠️ Troubleshooting**

### **Common Issues**

#### **1. Node.js Version Issues**
```bash
# Ensure Node.js 20+ is installed
node --version

# If using nvm, switch to Node.js 20
nvm install 20
nvm use 20
```

#### **2. Database Connection Issues**
```bash
# Test database connection
npx prisma db push

# Check environment variables
echo $DATABASE_URL
```

#### **3. API Endpoint Issues**
```bash
# Verify API is running
curl http://localhost:3001/api/health

# Check CORS configuration
# Ensure frontend URL is allowed in CORS settings
```

#### **4. Authentication Issues**
```bash
# Clear browser storage
localStorage.clear()

# Check JWT secret is set
echo $JWT_SECRET
```

---

## **📈 Monitoring and Maintenance**

### **AWS Monitoring**
- CloudWatch for logs and metrics
- AWS X-Ray for tracing
- CloudTrail for audit logs

### **GCP Monitoring**
- Cloud Monitoring for metrics
- Cloud Logging for logs
- Cloud Trace for performance

### **Regular Maintenance**
- Monitor free tier usage
- Set up billing alerts
- Regular security updates
- Database backups

---

## **🎯 Next Steps**

1. **Choose your platform** (AWS or GCP)
2. **Follow the setup steps** for your chosen platform
3. **Configure your environment** variables
4. **Deploy using the provided scripts**
5. **Test your deployment** thoroughly
6. **Set up monitoring** and alerts

---

## **📞 Support**

If you encounter issues:
1. Check the troubleshooting section above
2. Review the platform-specific documentation
3. Check the logs in your cloud console
4. Ensure all environment variables are correctly set

---

*Ready to deploy PermitPro to the cloud! 🎉*
