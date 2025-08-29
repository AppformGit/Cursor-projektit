#!/bin/bash

echo "🚀 Building production version..."

# Clean previous build
rm -rf dist/

# Install dependencies
npm install

# Build production version
npm run build

# Create production package
mkdir -p production
cp -r dist/* production/
cp package.json production/
cp package-lock.json production/

# Create deployment info
echo "Build completed at: $(date)" > production/build-info.txt
echo "Git commit: $(git rev-parse --short HEAD)" >> production/build-info.txt

echo "✅ Production build complete!"
echo "📁 Production files are in the 'production' folder"
echo "📦 Ready to deploy to Raspberry Pi"
