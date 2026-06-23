#!/bin/bash

# ACSci Thunderstorm Alert - Server Startup Script

echo "🚀 Starting ACSci Thunderstorm Alert System..."
echo ""

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
lsof -ti:5001 -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Get network IP
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

# Start backend in background
echo "🔧 Starting backend server on port 5001..."
cd /Users/macbook/Desktop/Reaserch/backend
nohup npm start > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Start frontend in background
echo "🎨 Starting frontend server on port 3000..."
cd /Users/macbook/Desktop/Reaserch/frontend
nohup npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to compile
echo ""
echo "⏳ Waiting for servers to start (this takes ~15 seconds)..."
sleep 15

# Check if servers are running
echo ""
if lsof -i :5001 > /dev/null 2>&1; then
    echo "✅ Backend server is running on port 5001"
else
    echo "❌ Backend server failed to start - check /tmp/backend.log"
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo "✅ Frontend server is running on port 3000"
else
    echo "❌ Frontend server failed to start - check /tmp/frontend.log"
fi

echo ""
echo "🌐 Access URLs:"
echo "   Laptop:  http://$NETWORK_IP:3000"
echo "   iPhone:  http://$NETWORK_IP:3000 (Safari)"
echo ""
echo "📝 Server logs:"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo "🛑 To stop servers: lsof -ti:5001 -ti:3000 | xargs kill -9"
echo ""
echo "✨ Servers are running in the background!"
