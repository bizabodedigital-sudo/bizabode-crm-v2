#!/bin/bash

# Bizabode CRM - Coolify Deployment Preparation Script
# This script prepares the project for Coolify deployment

echo "🚀 Preparing Bizabode CRM for Coolify deployment..."

# Create deployment directory
DEPLOY_DIR="bizabode-crm-coolify-deployment"
mkdir -p $DEPLOY_DIR

echo "📁 Creating deployment package..."

# Copy essential files
cp -r app $DEPLOY_DIR/
cp -r components $DEPLOY_DIR/
cp -r lib $DEPLOY_DIR/
cp -r config $DEPLOY_DIR/
cp -r cron $DEPLOY_DIR/
cp -r hooks $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp -r scripts $DEPLOY_DIR/
cp -r styles $DEPLOY_DIR/
cp -r docs $DEPLOY_DIR/

# Copy configuration files
cp package.json $DEPLOY_DIR/
cp pnpm-lock.yaml $DEPLOY_DIR/
cp tsconfig.json $DEPLOY_DIR/
cp next.config.js $DEPLOY_DIR/
cp postcss.config.mjs $DEPLOY_DIR/
cp components.json $DEPLOY_DIR/
cp middleware.ts $DEPLOY_DIR/
cp next-env.d.ts $DEPLOY_DIR/

# Copy deployment files
cp Dockerfile.production $DEPLOY_DIR/Dockerfile
cp docker-compose.coolify.yml $DEPLOY_DIR/docker-compose.yml
cp env.coolify.template $DEPLOY_DIR/.env.template
cp COOLIFY_DEPLOYMENT_README.md $DEPLOY_DIR/README.md

# Copy git files
cp .gitignore $DEPLOY_DIR/
cp .dockerignore $DEPLOY_DIR/

# Remove unnecessary files from deployment
cd $DEPLOY_DIR
rm -rf .next
rm -rf node_modules
rm -rf .git
rm -rf .cursor
rm -rf .vscode
rm -rf .swc

# Clean up scripts directory
rm -f scripts/api-seed.js
rm -f scripts/comprehensive-seed.ts
rm -f scripts/local-seed.ts
rm -f scripts/production-seed.ts

# Keep only essential scripts
echo "📝 Keeping essential scripts:"
ls -la scripts/

cd ..

echo "✅ Deployment package created: $DEPLOY_DIR"
echo ""
echo "📦 Deployment package contents:"
ls -la $DEPLOY_DIR/
echo ""
echo "🚀 Ready for Coolify deployment!"
echo ""
echo "Next steps:"
echo "1. Upload the '$DEPLOY_DIR' folder to your Git repository"
echo "2. Follow the README.md instructions for Coolify deployment"
echo "3. Set environment variables in Coolify dashboard"
echo "4. Deploy!"
