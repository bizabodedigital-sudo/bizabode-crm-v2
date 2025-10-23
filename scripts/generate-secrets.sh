#!/bin/bash

# ===========================================
# BIZABODE CRM - SECRET GENERATOR
# ===========================================
# This script generates secure secrets for production

echo "🔐 Generating secure secrets for Bizabode CRM production environment..."
echo ""

# Generate NextAuth Secret (32 characters)
NEXTAUTH_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "NEXTAUTH_SECRET=$NEXTAUTH_SECRET"

# Generate JWT Secret (32 characters)
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "JWT_SECRET=$JWT_SECRET"

# Generate Session Secret (32 characters)
SESSION_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
echo "SESSION_SECRET=$SESSION_SECRET"

# Generate MongoDB Password (16 characters)
MONGO_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
echo "MONGO_ROOT_PASSWORD=$MONGO_PASSWORD"

echo ""
echo "✅ Secrets generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy the secrets above to your .env file"
echo "2. Update NEXTAUTH_URL to your production domain"
echo "3. Update NEXT_PUBLIC_API_BASE_URL to your production domain"
echo "4. Configure email settings if needed"
echo "5. Set up SSL certificates in ./ssl/ directory"
echo ""
echo "⚠️  IMPORTANT: Keep these secrets secure and never commit them to version control!"
