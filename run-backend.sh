#!/bin/bash

# Simple Lakra Backend Server Startup Script

set -e  # Exit on any error

# Navigate to the backend directory
cd "$(dirname "$0")/backend"

echo "🚀 Starting Lakra Backend Server..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update packages
echo "📥 Installing packages..."
pip install -r requirements.txt

# Start the server
echo "🌐 Starting server at http://localhost:8000"
echo "📚 API docs at http://localhost:8000/docs"
echo "🔄 Running in background..."
echo ""

# Run the server in background and save PID
uvicorn main:app --host 0.0.0.0 --port 8000 > server.log 2>&1 &
SERVER_PID=$!

# Save PID to file for easy stopping later
echo $SERVER_PID > server.pid

echo "✅ Server started with PID: $SERVER_PID"
echo "📄 Logs are being written to: $(pwd)/server.log"
echo "🛑 To stop the server, run: kill $SERVER_PID"
echo "   Or use: kill \$(cat $(pwd)/server.pid)"
