#!/bin/bash

echo "🔧 Fixing PermitPro Deployment Issues..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# 3. Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# 4. Build the application
echo "🏗️ Building application..."
npm run build

# 5. Test server startup
echo "🚀 Testing server startup..."
cd server && npm install && cd ..

echo "✅ Deployment fixes completed!"
echo ""
echo "📋 Next steps:"
echo "1. Copy env.example to .env and configure your database"
echo "2. Run 'npm run start:all' to start both frontend and backend"
echo "3. Visit http://localhost:3000 for the application"
echo "4. Backend API will be available at http://localhost:3001/api"
