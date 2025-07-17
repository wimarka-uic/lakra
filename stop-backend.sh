#!/bin/bash

# Lakra Backend Server with Caddy Proxy Stop Script

# Get the project root directory
PROJECT_ROOT="$(dirname "$0")"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "🛑 Stopping Lakra Backend Services..."

# Function to stop a service by PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    local pid_dir=$3
    
    cd "$pid_dir"
    
    # Check if PID file exists
    if [ ! -f "$pid_file" ]; then
        echo "⚠️  No $pid_file file found for $service_name. Service may not be running."
        return 1
    fi
    
    # Read PID from file
    local SERVICE_PID=$(cat "$pid_file")
    
    # Check if process is actually running
    if ! ps -p $SERVICE_PID > /dev/null 2>&1; then
        echo "❌ $service_name process with PID $SERVICE_PID is not running."
        echo "🧹 Cleaning up stale PID file..."
        rm "$pid_file"
        return 1
    fi
    
    # Kill the process
    echo "🔄 Stopping $service_name with PID: $SERVICE_PID"
    kill $SERVICE_PID
    
    # Wait a moment and check if it's really stopped
    sleep 2
    
    if ps -p $SERVICE_PID > /dev/null 2>&1; then
        echo "⚠️  $service_name still running, forcing kill..."
        kill -9 $SERVICE_PID
        sleep 1
    fi
    
    # Clean up PID file
    if [ -f "$pid_file" ]; then
        rm "$pid_file"
        echo "🧹 Cleaned up $service_name PID file"
    fi
    
    echo "✅ $service_name stopped successfully!"
    return 0
}

# Stop Caddy proxy first
echo "🔄 Stopping Caddy proxy..."
stop_service "Caddy" "caddy.pid" "$PROJECT_ROOT"

# Stop FastAPI server
echo "🔄 Stopping FastAPI server..."
stop_service "FastAPI" "server.pid" "$BACKEND_DIR"

# Additional cleanup - kill any remaining uvicorn processes for this project
echo "🧹 Checking for any remaining backend processes..."
REMAINING_PROCESSES=$(pgrep -f "uvicorn main:app" || true)
if [ ! -z "$REMAINING_PROCESSES" ]; then
    echo "🔄 Killing remaining uvicorn processes: $REMAINING_PROCESSES"
    pkill -f "uvicorn main:app" || true
    sleep 1
fi

# Additional cleanup - kill any remaining caddy processes if needed
REMAINING_CADDY=$(pgrep -f "caddy run --config Caddyfile" || true)
if [ ! -z "$REMAINING_CADDY" ]; then
    echo "🔄 Killing remaining Caddy processes: $REMAINING_CADDY"
    pkill -f "caddy run --config Caddyfile" || true
    sleep 1
fi

echo ""
echo "✅ All backend services stopped successfully!"
echo "🧹 Cleanup completed."
