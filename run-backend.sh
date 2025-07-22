#!/bin/bash

# Lakra Backend Server with Caddy Proxy Startup Script

set -e  # Exit on any error

# Get the project root directory
PROJECT_ROOT="$(dirname "$0")"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🚀 Starting Lakra Backend Server with Caddy Proxy..."

# Check if Caddy is installed
if ! command -v caddy &> /dev/null; then
    echo "❌ Caddy is not installed. Please install Caddy first:"
    echo "   Ubuntu/Debian: sudo apt install caddy"
    echo "   macOS: brew install caddy"
    echo "   Or visit: https://caddyserver.com/docs/install"
    exit 1
fi

# Check for existing processes
EXISTING_CADDY=$(pgrep -f "caddy run" || true)
EXISTING_UVICORN=$(pgrep -f "uvicorn main:app" || true)

if [ ! -z "$EXISTING_CADDY" ] || [ ! -z "$EXISTING_UVICORN" ]; then
    echo "⚠️  Existing backend processes found:"
    [ ! -z "$EXISTING_CADDY" ] && echo "   Caddy: $EXISTING_CADDY"
    [ ! -z "$EXISTING_UVICORN" ] && echo "   Uvicorn: $EXISTING_UVICORN"
    echo "   Please run ./stop-backend.sh first or kill these processes manually"
    exit 1
fi

# Check if we can bind to port 443 (requires root or CAP_NET_BIND_SERVICE)
if [ "$EUID" -ne 0 ] && ! command -v setcap &> /dev/null; then
    echo "⚠️  Warning: Port 443 requires root privileges or CAP_NET_BIND_SERVICE capability."
    echo "   You may need to run this script with sudo or give Caddy the capability:"
    echo "   sudo setcap cap_net_bind_service=+ep \$(which caddy)"
    echo ""
fi

# Navigate to the backend directory
cd "$BACKEND_DIR"

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

# Create log directory for Caddy if it doesn't exist
sudo mkdir -p /var/log/caddy
sudo chown $USER:$USER /var/log/caddy 2>/dev/null || true

# Start the FastAPI server
echo "🌐 Starting FastAPI server at http://localhost:8000"
echo "📚 API docs will be at http://localhost:8000/docs"
echo "🔄 Running FastAPI in background..."

# Run the FastAPI server in background and save PID
uvicorn main:app --host 127.0.0.1 --port 8000 > server.log 2>&1 &
SERVER_PID=$!

# Save PID to file for easy stopping later
echo $SERVER_PID > server.pid

# Wait a moment for the server to start
sleep 2

# Check if FastAPI server is running
if ! ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "❌ Failed to start FastAPI server. Check server.log for errors."
    exit 1
fi

# Start Caddy proxy
echo "🌐 Starting Caddy proxy at https://localhost:443"
cd "$PROJECT_ROOT"

# Run Caddy in background and save PID
caddy run --config Caddyfile > caddy.log 2>&1 &
CADDY_PID=$!

# Save Caddy PID to file
echo $CADDY_PID > caddy.pid

# Wait a moment for Caddy to start
sleep 2

# Check if Caddy is running
if ! ps -p $CADDY_PID > /dev/null 2>&1; then
    echo "❌ Failed to start Caddy. Check caddy.log for errors."
    # Clean up FastAPI server
    kill $SERVER_PID 2>/dev/null || true
    rm -f "$BACKEND_DIR/server.pid"
    exit 1
fi

echo ""
echo "✅ Backend services started successfully!"
echo "🎯 FastAPI Server: http://localhost:8000 (PID: $SERVER_PID)"
echo "🌐 Caddy Proxy: https://localhost:443 (PID: $CADDY_PID)"
echo "📚 API Documentation: https://localhost:443/docs"
echo "🏥 Health Check: https://localhost:443/health"
echo ""
echo "📄 Logs:"
echo "   FastAPI: $BACKEND_DIR/server.log"
echo "   Caddy: $PROJECT_ROOT/caddy.log"
echo ""
echo "🛑 To stop all services, run: ./stop-backend.sh"
