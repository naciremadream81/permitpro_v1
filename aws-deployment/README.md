# 🚀 AWS Free Tier Deployment Guide

## **AWS Free Tier Services Used**

### **Compute & Hosting:**
- **AWS Amplify** - Frontend hosting (Free tier: 1000 build minutes/month)
- **AWS Lambda** - Serverless backend functions (Free tier: 1M requests/month)
- **AWS API Gateway** - API management (Free tier: 1M API calls/month)

### **Database:**
- **Amazon RDS** - PostgreSQL database (Free tier: 750 hours/month for 12 months)
- **Amazon DynamoDB** - NoSQL database (Free tier: 25GB storage, 25 read/write capacity units)

### **Storage:**
- **Amazon S3** - File storage (Free tier: 5GB storage, 20,000 GET requests, 2,000 PUT requests)

### **Security & Authentication:**
- **AWS Cognito** - User authentication (Free tier: 50,000 monthly active users)

---

## **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AWS Amplify   │    │   API Gateway   │    │   AWS Lambda    │
│   (Frontend)    │◄──►│   (API Routes)  │◄──►│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │   Amazon S3     │              │
                       │   (File Storage)│◄─────────────┘
                       └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │   Amazon RDS    │              │
                       │   (PostgreSQL)  │◄─────────────┘
                       └─────────────────┘
```

---

## **Prerequisites**

1. **AWS Account** with free tier eligibility
2. **AWS CLI** installed and configured
3. **Node.js 20+** installed (required for Firebase CLI compatibility)
4. **Git** for version control

---

## **Quick Start**

### **1. Clone and Setup**
```bash
git clone <your-repo>
cd permitpro_v1

# Fix any deployment issues first
./fix-deployment.sh

# Install dependencies
npm install
```

### **2. Configure Environment**
```bash
# Copy environment template
cp env.example .env

# Edit .env with your AWS credentials and database settings
# Required variables:
# - DATABASE_URL (for RDS PostgreSQL)
# - JWT_SECRET
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
```

### **3. Deploy Backend**
```bash
cd aws-deployment
./deploy-backend.sh
```

### **4. Deploy Frontend**
```bash
./deploy-frontend.sh
```

### **5. Verify Deployment**
```bash
# Test API endpoints
curl https://your-api-gateway-url.amazonaws.com/api/health

# Test frontend
open https://your-amplify-app.amplifyapp.com
```

---

## **Cost Estimation (Free Tier)**

| Service | Free Tier Limit | Monthly Cost |
|---------|----------------|--------------|
| AWS Amplify | 1000 build minutes | $0 |
| AWS Lambda | 1M requests | $0 |
| API Gateway | 1M API calls | $0 |
| RDS PostgreSQL | 750 hours | $0 |
| S3 Storage | 5GB | $0 |
| **Total** | | **$0/month** |

---

## **File Structure**

```
aws-deployment/
├── README.md
├── backend/
│   ├── serverless.yml
│   ├── handler.js
│   └── package.json
├── frontend/
│   ├── amplify.yml
│   └── build-settings.json
├── database/
│   ├── schema.sql
│   └── migrations/
├── scripts/
│   ├── deploy-backend.sh
│   ├── deploy-frontend.sh
│   └── setup-environment.sh
└── terraform/
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

---

## **Next Steps**

1. **Follow the deployment scripts** in order
2. **Configure your domain** (optional)
3. **Set up monitoring** with CloudWatch
4. **Configure backups** for your database
5. **Set up CI/CD** with GitHub Actions

---

*Ready for AWS Free Tier deployment! 🎉*
