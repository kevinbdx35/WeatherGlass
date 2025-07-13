#!/bin/bash

# WeatherGlass Deployment Script for GitHub Pages
echo "🚀 Deploying WeatherGlass to GitHub Pages..."

# Clean and build
echo "📦 Building production version..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Copy build files to the root for GitHub Pages
    echo "📋 Copying files for GitHub Pages deployment..."
    
    # Navigate to the parent directory to access the repo root
    cd ..
    
    # Remove old files (but keep important ones)
    echo "🧹 Cleaning old deployment files..."
    find . -maxdepth 1 -name "*.html" -not -name "README.md" -delete 2>/dev/null
    find . -maxdepth 1 -name "*.js" -delete 2>/dev/null
    find . -maxdepth 1 -name "*.css" -delete 2>/dev/null
    find . -maxdepth 1 -name "*.json" -not -name "package.json" -not -name "package-lock.json" -delete 2>/dev/null
    find . -maxdepth 1 -name "*.xml" -delete 2>/dev/null
    find . -maxdepth 1 -name "*.txt" -not -name "README.txt" -delete 2>/dev/null
    rm -rf static/ 2>/dev/null
    
    # Copy build files to root
    echo "📁 Copying new build files..."
    cp -r client/build/* .
    
    # Copy important files from public to root
    cp client/public/sitemap.xml .
    cp client/public/robots.txt .
    cp client/public/manifest.json .
    cp client/public/landing.html .
    
    echo "✅ Files copied successfully!"
    echo ""
    echo "📄 Deployment ready! Files in root directory:"
    ls -la *.html *.js *.css *.json *.xml *.txt static/ 2>/dev/null
    echo ""
    echo "🔧 Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Deploy WeatherGlass with SEO optimizations'"
    echo "3. git push origin main"
    echo ""
    echo "🌐 Your app will be available at: https://kevinbdx35.github.io/WeatherGlass/"
    
else
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi