#!/bin/bash

# Get local IP address
#LOCAL_IP=$(hostname -I | awk '{print $1}')
LOCAL_IP="localhost"  # Default to localhost

echo "🌐 Starting Validuct on Local Network"
echo "=================================="
echo "Local IP: $LOCAL_IP"
echo ""

# Check if backend .env has CORS_ORIGIN=*
if ! grep -q "CORS_ORIGIN=\*" backend/.env; then
    echo "⚠️  Updating backend CORS to allow network access..."
    sed -i 's/CORS_ORIGIN=.*/CORS_ORIGIN=*/' backend/.env
fi

# Create network .env for frontend if it doesn't exist
if [ ! -f "frontend/.env.local.network" ]; then
    echo "📝 Creating network configuration for frontend..."
    cat > frontend/.env.local.network << EOF
NEXT_PUBLIC_API_URL=http://$LOCAL_IP:5000/api/v1
NEXT_PUBLIC_APP_URL=http://$LOCAL_IP:3000

NEXTAUTH_URL=http://$LOCAL_IP:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production-use-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=928485331672-p87qo4juji6jvm2seu8k880vs93ock1f.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://$LOCAL_IP:3000/api/auth/google/callback
EOF
fi

# Backup current .env.local and use network version
if [ -f "frontend/.env.local" ]; then
    echo "💾 Backing up current frontend .env.local..."
    cp frontend/.env.local frontend/.env.local.backup
fi

echo "🔄 Switching to network configuration..."
cp frontend/.env.local.network frontend/.env.local

echo ""
echo "✅ Configuration complete!"
echo ""
echo "📍 Access URLs:"
echo "   Frontend: http://$LOCAL_IP:3000"
echo "   Backend:  http://$LOCAL_IP:5000"
echo ""
echo "🚀 Starting servers..."
echo "   - Backend will start in the background"
echo "   - Frontend will start in the foreground"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "=================================="
echo ""

# Start backend in background
cd backend
npm run dev > /tmp/validuct-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend in foreground (bound to all interfaces)
cd ../frontend
npm run dev -- -H 0.0.0.0

# Cleanup on exit
kill $BACKEND_PID 2>/dev/null
echo ""
echo "🛑 Servers stopped"
