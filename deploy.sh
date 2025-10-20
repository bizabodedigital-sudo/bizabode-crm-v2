#!/bin/bash

# Bizabode CRM Deployment Script for Coolify
# This script handles the deployment process

set -e

echo "🚀 Starting Bizabode CRM deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p ssl
mkdir -p logs

# Set proper permissions
chmod 755 uploads
chmod 700 ssl

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f env.production.example ]; then
        cp env.production.example .env
        echo "📝 Please edit .env file with your production values before continuing."
        echo "   Important: Change all passwords and secrets!"
        read -p "Press Enter after editing .env file..."
    else
        echo "❌ No environment example file found. Please create .env manually."
        exit 1
    fi
fi

# Validate environment variables
echo "🔍 Validating environment variables..."
source .env

if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your_super_secure_jwt_secret_here_minimum_32_characters" ]; then
    echo "❌ JWT_SECRET is not set or using default value. Please set a secure secret."
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ] || [ "$NEXTAUTH_SECRET" = "your_nextauth_secret_here_minimum_32_characters" ]; then
    echo "❌ NEXTAUTH_SECRET is not set or using default value. Please set a secure secret."
    exit 1
fi

# Build the application
echo "🔨 Building application..."
docker-compose build --no-cache

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Application should be available at:"
    echo "   - HTTP: http://localhost"
    echo "   - Direct: http://localhost:3000"
    echo ""
    echo "📊 To view logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 To stop services:"
    echo "   docker-compose down"
    echo ""
    echo "🔄 To restart services:"
    echo "   docker-compose restart"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose logs
    exit 1
fi

echo "🎉 Deployment completed successfully!"
