#!/bin/bash

# Bizabode CRM - Coolify Production Deployment Script
# This script automates the deployment process for Coolify

set -e

echo "🚀 Starting Bizabode CRM Production Deployment on Coolify..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if [ ! -f "coolify.yml" ]; then
        print_error "coolify.yml not found!"
        exit 1
    fi
    
    if [ ! -f "Dockerfile.production" ]; then
        print_error "Dockerfile.production not found!"
        exit 1
    fi
    
    if [ ! -f "docker-compose.production.yml" ]; then
        print_error "docker-compose.production.yml not found!"
        exit 1
    fi
    
    if [ ! -f "nginx.conf" ]; then
        print_error "nginx.conf not found!"
        exit 1
    fi
    
    print_success "All required files found!"
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p uploads
    mkdir -p logs
    mkdir -p ssl
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p monitoring/grafana/provisioning/dashboards
    
    print_success "Directories created!"
}

# Set up environment variables
setup_environment() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env.production" ]; then
        print_warning "Creating .env.production from template..."
        cp env.production.example .env.production
        
        print_warning "Please edit .env.production with your actual values:"
        print_warning "- MONGODB_URI"
        print_warning "- JWT_SECRET"
        print_warning "- NEXTAUTH_SECRET"
        print_warning "- NEXTAUTH_URL"
        print_warning "- SMTP credentials (if using email)"
        
        read -p "Press Enter to continue after editing .env.production..."
    fi
    
    print_success "Environment variables configured!"
}

# Build and test Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build production image
    docker build -f Dockerfile.production -t bizabode-crm:latest .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully!"
    else
        print_error "Docker build failed!"
        exit 1
    fi
}

# Test the application locally
test_application() {
    print_status "Testing application locally..."
    
    # Start services
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to start
    sleep 30
    
    # Test health endpoint
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Application is healthy!"
    else
        print_error "Application health check failed!"
        docker-compose -f docker-compose.production.yml logs
        exit 1
    fi
    
    # Stop services
    docker-compose -f docker-compose.production.yml down
    
    print_success "Application test completed!"
}

# Create deployment package
create_deployment_package() {
    print_status "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy necessary files
    cp coolify.yml deployment/
    cp Dockerfile.production deployment/
    cp docker-compose.production.yml deployment/
    cp nginx.conf deployment/
    cp -r monitoring deployment/
    cp -r scripts deployment/
    cp .env.production deployment/.env
    
    # Create deployment script
    cat > deployment/deploy.sh << 'EOF'
#!/bin/bash
# Coolify deployment script

echo "🚀 Deploying Bizabode CRM to Coolify..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start services
docker-compose -f docker-compose.production.yml up -d

echo "✅ Deployment completed!"
echo "🌐 Application URL: https://yourdomain.com"
echo "📊 Health Check: https://yourdomain.com/api/health"
echo "📈 Monitoring: https://yourdomain.com:3001 (Grafana)"
echo "📊 Metrics: https://yourdomain.com:9090 (Prometheus)"
EOF
    
    chmod +x deployment/deploy.sh
    
    print_success "Deployment package created in ./deployment/"
}

# Generate deployment instructions
generate_instructions() {
    print_status "Generating deployment instructions..."
    
    cat > DEPLOYMENT_INSTRUCTIONS.md << 'EOF'
# 🚀 Coolify Deployment Instructions

## Prerequisites
1. Coolify server running
2. Domain name configured
3. SSL certificate (Let's Encrypt or custom)

## Deployment Steps

### 1. Upload to Coolify
1. Login to your Coolify dashboard
2. Create new application
3. Select "Docker Compose" as source
4. Upload the `coolify.yml` file
5. Configure environment variables

### 2. Environment Variables
Set these in Coolify dashboard:
```
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/bizabode_crm
JWT_SECRET=your_super_secure_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://yourdomain.com
PORT=3000
HOSTNAME=0.0.0.0
```

### 3. Domain Configuration
1. Point your domain to Coolify server IP
2. Enable SSL in Coolify dashboard
3. Configure custom domain

### 4. Start Deployment
1. Click "Deploy" in Coolify dashboard
2. Monitor deployment logs
3. Verify health check endpoint

## Post-Deployment

### Health Checks
- Application: https://yourdomain.com/api/health
- Database: Connected
- Monitoring: https://yourdomain.com:3001

### Default Login
- Admin: admin@bizabodedigital.com / demo123
- Employee: EMP001 / EMP001

## Monitoring
- Grafana: https://yourdomain.com:3001
- Prometheus: https://yourdomain.com:9090
- Application Logs: Available in Coolify dashboard

## Troubleshooting
1. Check Coolify logs
2. Verify environment variables
3. Test database connection
4. Check SSL certificate

## Support
- Documentation: README.md
- Health Check: /api/health
- Logs: Coolify dashboard
EOF
    
    print_success "Deployment instructions created!"
}

# Main deployment function
main() {
    echo "🎯 Bizabode CRM - Coolify Production Deployment"
    echo "=============================================="
    
    check_prerequisites
    create_directories
    setup_environment
    build_images
    test_application
    create_deployment_package
    generate_instructions
    
    print_success "🎉 Deployment preparation completed!"
    print_status "Next steps:"
    print_status "1. Review and edit .env.production with your values"
    print_status "2. Upload deployment package to Coolify"
    print_status "3. Configure domain and SSL in Coolify"
    print_status "4. Deploy application"
    print_status "5. Test health check endpoint"
    
    echo ""
    print_success "📁 Deployment package created in ./deployment/"
    print_success "📋 Instructions created in DEPLOYMENT_INSTRUCTIONS.md"
    print_success "🚀 Ready for Coolify deployment!"
}

# Run main function
main "$@"
