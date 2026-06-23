#!/bin/bash

# Weather Monitor Application Setup Script

echo "🌦️  Weather Monitor Application Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed."
    echo ""
    echo "Please install Node.js first:"
    echo "  - Visit: https://nodejs.org/"
    echo "  - Or use Homebrew: brew install node"
    echo ""
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo "✅ npm found: $(npm --version)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
cd ..
echo "✅ Frontend dependencies installed"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd backend && npm start"
echo "  2. Frontend: cd frontend && npm start"
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:3000"
