# PermitPro Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Start Development Environment

```bash
# Make the startup script executable (if not already)
chmod +x start-dev.sh

# Start both frontend and backend servers
./start-dev.sh
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### 3. Demo Login Credentials

- **Regular User**: `demo@permitpro.com` / `demo123`
- **Admin User**: `admin@permitpro.com` / `admin123`

## 🔧 Manual Setup (Alternative)

If you prefer to start servers manually:

### Backend Server
```bash
cd server
npm install
npm start
```

### Frontend Server
```bash
npm install
npm run dev
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000 and 3001
   sudo lsof -ti:3000 | xargs kill -9
   sudo lsof -ti:3001 | xargs kill -9
   ```

2. **Database Issues**
   ```bash
   cd server
   npx prisma migrate reset
   npx prisma migrate dev --name init
   ```

3. **Permission Issues**
   ```bash
   chmod +x start-dev.sh
   ```

### Error Messages

- **403 Forbidden**: Authentication token expired or invalid
- **404 Not Found**: API endpoint doesn't exist or server not running
- **Network Error**: Backend server not running on port 3001

## 📁 Project Structure

```
permitpro_v1/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility libraries
├── server/                 # Backend server
│   ├── src/
│   │   ├── api/           # API routes
│   │   ├── config/        # Configuration
│   │   └── middleware/    # Express middleware
│   └── prisma/            # Database schema and migrations
├── start-dev.sh           # Development startup script
└── SETUP.md              # This file
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Packages
- `GET /api/packages` - Get all packages
- `POST /api/packages` - Create new package
- `PUT /api/packages/:id/status` - Update package status
- `POST /api/packages/:id/documents` - Upload document
- `GET /api/packages/:id/download-all` - Download all documents

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🛠️ Development

### Adding New Features
1. Create API endpoint in `server/src/api/`
2. Add corresponding method in `lib/api.js`
3. Update frontend components as needed

### Database Changes
```bash
cd server
npx prisma migrate dev --name your_migration_name
```

## 📝 Notes

- The application uses SQLite for development (stored in `server/prisma/dev.db`)
- JWT tokens expire after 24 hours
- Demo users are hardcoded for development purposes
- File uploads are simulated (no actual file storage implemented)

## 🆘 Support

If you encounter issues:
1. Check the console logs for error messages
2. Ensure both servers are running
3. Verify database is properly initialized
4. Check network connectivity between frontend and backend
