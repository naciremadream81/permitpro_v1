# ☁️ Google Cloud Platform Free Tier Deployment Guide

## **GCP Free Tier Services Used**

### **Compute & Hosting:**
- **Firebase Hosting** - Frontend hosting (Free tier: 10GB storage, 10GB transfer/month)
- **Cloud Functions** - Serverless backend functions (Free tier: 2M invocations/month)
- **Cloud Run** - Containerized backend (Free tier: 2M requests/month)

### **Database:**
- **Cloud SQL** - PostgreSQL database (Free tier: 1 instance, 1GB RAM, 10GB storage)
- **Firestore** - NoSQL database (Free tier: 1GB storage, 50K reads, 20K writes/day)

### **Storage:**
- **Cloud Storage** - File storage (Free tier: 5GB storage, 1GB egress/month)

### **Security & Authentication:**
- **Firebase Authentication** - User authentication (Free tier: Unlimited users)

---

## **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Firebase Hosting│    │  Cloud Functions│    │   Cloud Run     │
│   (Frontend)    │◄──►│   (API Routes)  │◄──►│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │ Cloud Storage   │              │
                       │ (File Storage)  │◄─────────────┘
                       └─────────────────┘
                                                        │
                       ┌─────────────────┐              │
                       │   Cloud SQL     │              │
                       │  (PostgreSQL)   │◄─────────────┘
                       └─────────────────┘
```

---

## **Prerequisites**

1. **Google Cloud Account** with free tier eligibility
2. **Google Cloud SDK** installed and configured
3. **Node.js 20+** installed (required for Firebase CLI compatibility)
4. **Firebase CLI** installed and authenticated
5. **Git** for version control

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

# Edit .env with your GCP credentials and database settings
# Required variables:
# - DATABASE_URL (for Cloud SQL PostgreSQL)
# - JWT_SECRET
# - GOOGLE_APPLICATION_CREDENTIALS (path to service account key)
```

### **3. Deploy Backend**
```bash
cd gcp-deployment
./deploy-backend.sh
```

### **4. Deploy Frontend**
```bash
./deploy-frontend.sh
```

### **5. Verify Deployment**
```bash
# Test API endpoints
curl https://your-project-id.appspot.com/api/health

# Test frontend
open https://your-project-id.web.app
```

---

## **Cost Estimation (Free Tier)**

| Service | Free Tier Limit | Monthly Cost |
|---------|----------------|--------------|
| Firebase Hosting | 10GB storage, 10GB transfer | $0 |
| Cloud Functions | 2M invocations | $0 |
| Cloud Run | 2M requests | $0 |
| Cloud SQL | 1 instance, 1GB RAM | $0 |
| Cloud Storage | 5GB storage | $0 |
| **Total** | | **$0/month** |

---

## **File Structure**

```
gcp-deployment/
├── README.md
├── backend/
│   ├── app.yaml
│   ├── package.json
│   └── index.js
├── functions/
│   ├── package.json
│   └── index.js
├── frontend/
│   ├── firebase.json
│   └── .firebaserc
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
3. **Set up monitoring** with Cloud Monitoring
4. **Configure backups** for your database
5. **Set up CI/CD** with Cloud Build

---

*Ready for GCP Free Tier deployment! 🎉*
