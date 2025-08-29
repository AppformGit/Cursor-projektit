#!/bin/bash

echo "🔄 Updating reclamation-stats-app..."

# Navigate to app directory
cd /home/pi/reclamation-stats-app

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Build production version
echo "🔨 Building production version..."
npm run build

# Restart the service (if using PM2)
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting PM2 service..."
    pm2 restart reclamation-stats-app
else
    echo "⚠️  PM2 not found. Please restart your service manually."
fi

echo "✅ Update complete!"
echo "📊 App should be running with latest changes"
