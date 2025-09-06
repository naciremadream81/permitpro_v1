# ☁️ Cloud Deployment Guide - AWS & Google Cloud Platform

## **🎯 Overview**

This guide will help you deploy your PermitPro application to either AWS Free Tier or Google Cloud Platform Free Tier. Both platforms offer generous free tiers that can host your application at **$0/month** cost.

---

## **📊 Platform Comparison**

| Feature | AWS Free Tier | GCP Free Tier |
|---------|---------------|---------------|
| **Frontend Hosting** | AWS Amplify | Firebase Hosting |
| **Backend** | AWS Lambda | Cloud Functions/App Engine |
| **Database** | RDS PostgreSQL | Cloud SQL PostgreSQL |
| **File Storage** | S3 | Cloud Storage |
| **Authentication** | AWS Cognito | Firebase Auth |
| **Free Tier Duration** | 12 months | Always free (with limits) |
| **Setup Complexity** | Medium | Easy |
| **Scalability** | Excellent | Excellent |

---

## **🚀 Quick Start - Choose Your Platform**

### **Option 1: AWS Free Tier (Recommended for Production)**
```bash
cd aws-deployment
./scripts/deploy-backend.sh
./scripts/deploy-frontend.sh
```

### **Option 2: Google Cloud Platform (Recommended for Development)**
```bash
cd gcp-deployment
./scripts/deploy-backend.sh
./scripts/deploy-frontend.sh
```

---

## **🔧 Prerequisites**

### **For AWS Deployment:**
1. **AWS Account** with free tier eligibility
2. **AWS CLI** installed and configured
3. **Node.js** 18+ installed
4. **Serverless Framework** (will be installed automatically)

### **For GCP Deployment:**
1. **Google Cloud Account** with free tier eligibility
2. **Google Cloud SDK** installed and configured
3. **Node.js** 18+ installed
4. **Firebase CLI** (will be installed automatically)

---

## **📋 Step-by-Step Deployment**

### **Step 1: Prepare Your Environment**

#### **AWS Setup:**
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter your Access Key ID, Secret Access Key, and region (us-east-1)
```

#### **GCP Setup:**
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Configure GCP
gcloud init
# Select your project and authenticate
```

### **Step 2: Deploy Backend**

#### **AWS Backend:**
```bash
cd aws-deployment/backend
npm install
serverless deploy --stage dev
```
 dev
#### **GCP Backend:**
```bash
cd gcp-deployment/backend
npm install
gcloud app deploy
```

### **Step 3: Deploy Frontend**

#### **AWS Frontend:**
```bash
cd aws-deployment/frontend
amplify init
amplify add hosting
amplify publish
```

#### **GCP Frontend:**
```bash
cd gcp-deployment/frontend
firebase init hosting
firebase deploy
```

### **Step 4: Configure Environment Variables**

Update your frontend environment variables with the deployed API URLs:

#### **AWS (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://your-api-gateway-url.amazonaws.com/dev
```

```

---

## **💰 Cost Breakdown**

### **AWS Free Tier (12 months):**
- **AWS Amplify**: 1000 build minutes/month - **$0**
- **AWS Lambda**: 1M requests/month - **$0**
- **API Gateway**: 1M API calls/month - **$0**
- **RDS PostgreSQL**: 750 hours/month - **$0**
- **S3 Storage**: 5GB storage - **$0**
- **Total**: **$0/month**

### **GCP Free Tier (Always Free):**
- **Firebase Hosting**: 10GB storage, 10GB transfer - **$0**
- **Cloud Functions**: 2M invocations/month - **$0**
- **Cloud SQL**: 1 instance, 1GB RAM - **$0**
- **Cloud Storage**: 5GB storage - **$0**
- **Total**: **$0/month**

---

## **🔒 Security Considerations**

### **Database Security:**
- ✅ Encrypted connections (SSL/TLS)
- ✅ Private subnets (AWS) / VPC (GCP)
- ✅ Strong passwords and JWT secrets
- ✅ Regular security updates

### **API Security:**
- ✅ JWT token authentication
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Input validation

### **File Storage Security:**
- ✅ Private buckets with signed URLs
- ✅ Access control lists
- ✅ Encryption at rest

---

## **📈 Monitoring & Maintenance**

### **AWS Monitoring:**
- **CloudWatch** for logs and metrics
- **AWS X-Ray** for tracing
- **CloudTrail** for audit logs

### **GCP Monitoring:**
- **Cloud Monitoring** for metrics
- **Cloud Logging** for logs
- **Cloud Trace** for performance

---

## **🔄 CI/CD Setup**

### **GitHub Actions for AWS:**
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: cd aws-deployment && ./scripts/deploy-backend.sh
      - name: Deploy Frontend
        run: cd aws-deployment && ./scripts/deploy-frontend.sh
```

### **GitHub Actions for GCP:**
```yaml
name: Deploy to GCP
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: cd gcp-deployment && ./scripts/deploy-backend.sh
      - name: Deploy Frontend
        run: cd gcp-deployment && ./scripts/deploy-frontend.sh
```

---

## **🚨 Troubleshooting**

### **Common Issues:**

#### **AWS Issues:**
- **"Access Denied"**: Check IAM permissions
- **"Resource Not Found"**: Verify region and resource names
- **"Rate Limited"**: Implement exponential backoff

#### **GCP Issues:**
- **"Permission Denied"**: Check IAM roles
- **"Quota Exceeded"**: Request quota increase
- **"Billing Not Enabled"**: Enable billing for your project

### **Getting Help:**
- **AWS**: AWS Support (free tier includes basic support)
- **GCP**: Google Cloud Support (community support)
- **Documentation**: Platform-specific documentation

---

## **🎉 Success Checklist**

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database connected and populated
- [ ] File uploads working
- [ ] Authentication working
- [ ] API endpoints responding
- [ ] Environment variables configured
- [ ] Monitoring set up
- [ ] Backup strategy implemented

---

## **📚 Additional Resources**

### **AWS Resources:**
- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

### **GCP Resources:**
- [GCP Free Tier](https://cloud.google.com/free)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Documentation](https://cloud.google.com/functions/docs)

---

## **🎯 Next Steps**

1. **Deploy to your chosen platform** using the provided scripts
2. **Test all functionality** thoroughly
3. **Set up monitoring** and alerts
4. **Configure custom domain** (optional)
5. **Implement CI/CD** pipeline
6. **Set up backups** and disaster recovery
7. **Monitor costs** and usage

---

*Your PermitPro application is now ready for cloud deployment! 🚀*

*Choose your platform and follow the deployment scripts to get started.*
