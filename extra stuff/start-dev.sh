#!/bin/bash

# PermitPro Development Server Startup Script
echo "🚀 Starting PermitPro Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to start backend server
start_backend() {
    echo "📦 Starting backend server..."
    cd server
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing backend dependencies..."
        npm install
    fi
    
    # Check if Prisma database exists
    if [ ! -f "prisma/dev.db" ]; then
        echo "🗄️ Setting up database..."
        npx prisma migrate dev --name init
        npx prisma db seed
    fi
    
    echo "🔄 Starting backend server on port 3001..."
    npm start &
    BACKEND_PID=$!
    echo "Backend PID: $BACKEND_PID"
    cd ..
}

# Function to start frontend server
start_frontend() {
    echo "🎨 Starting frontend server..."
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing frontend dependencies..."
        npm install
    fi
    
    echo "🔄 Starting frontend server on port 3000..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
}

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start servers
start_backend
sleep 3  # Give backend time to start
start_frontend

echo "✅ Development environment started!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📊 Demo login: demo@permitpro.com / demo123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait
