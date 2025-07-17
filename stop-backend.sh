#!/bin/bash

# Simple Lakra Backend Server Stop Script

# Navigate to the backend directory
cd "$(dirname "$0")/backend"

echo "🛑 Stopping Lakra Backend Server..."

# Check if PID file exists
if [ ! -f "server.pid" ]; then
    echo "❌ No server.pid file found. Server may not be running."
    echo "   Try: ps aux | grep 'python main.py' to check manually"
    exit 1
fi

# Read PID from file
SERVER_PID=$(cat server.pid)

# Check if process is actually running
if ! ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "❌ Process with PID $SERVER_PID is not running."
    echo "🧹 Cleaning up stale PID file..."
    rm server.pid
    exit 1
fi

# Kill the process
echo "🔄 Stopping server with PID: $SERVER_PID"
kill $SERVER_PID

# Wait a moment and check if it's really stopped
sleep 2

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "⚠️  Process still running, forcing kill..."
    kill -9 $SERVER_PID
    sleep 1
fi

# Clean up PID file
if [ -f "server.pid" ]; then
    rm server.pid
    echo "🧹 Cleaned up PID file"
fi

echo "✅ Server stopped successfully!"
