# PermitPro - Cloud-Ready Permit Management System

A modern, full-stack permit management application built with Next.js and Express.js, ready for deployment on both AWS and Google Cloud Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- AWS CLI (for AWS deployment)
- Google Cloud CLI (for GCP deployment)

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

## 🌐 Live Deployments

### Google Cloud Platform
- **Frontend**: https://permitpro-463203.web.app
- **Backend**: https://permitpro-463203.uk.r.appspot.com
- **Status**: ✅ Active

### AWS (Coming Soon)
- **Frontend**: AWS Amplify
- **Backend**: AWS Lambda + API Gateway
- **Status**: 🔄 In Development

## 📁 Project Structure

```
permitpro_v1/
├── app/                    # Next.js frontend (main)
├── components/             # React components
├── lib/                    # API service layer
├── gcp-deployment/         # GCP deployment files
│   ├── backend/           # GCP App Engine backend
│   └── frontend/          # Firebase Hosting frontend
├── aws-deployment/         # AWS deployment files
│   ├── backend/           # AWS Lambda backend
│   └── frontend/          # AWS Amplify frontend
└── extra stuff/           # Legacy files and documentation
```

## 🛠️ Features

- **Multi-Platform Deployment**: AWS and GCP ready
- **Modern UI**: Built with Next.js 15 and Tailwind CSS
- **Authentication**: JWT-based user authentication
- **Permit Management**: Create, track, and manage permits
- **Contractor Management**: Assign primary and subcontractors
- **Checklist System**: Permit-specific requirement tracking
- **Document Upload**: File management for permits
- **Real-time Updates**: Live status tracking

## 📋 Supported Permit Types

- Mobile Home
- Modular Home  
- Shed Permit
- Home Addition
- HVAC Permit
- Electrical Permit
- Plumbing Permit

## 🔧 Deployment

See [CLOUD_DEPLOYMENT_GUIDE.md](CLOUD_DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 📞 Support

For issues or questions, please check the deployment guide or contact the development team.

---

**Built with ❤️ for efficient permit management**