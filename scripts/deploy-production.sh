#!/bin/bash

# Production Deployment Script for Bizabode CRM
# This script handles the complete production deployment process

set -e  # Exit on any error

# Configuration
APP_NAME="bizabode-crm"
APP_DIR="/opt/bizabode-crm"
BACKUP_DIR="/opt/backups/bizabode-crm"
LOG_FILE="/var/log/bizabode-crm/deploy.log"
SERVICE_NAME="bizabode-crm"
NGINX_CONFIG="/etc/nginx/sites-available/bizabode-crm"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    
    mkdir -p "$APP_DIR"
    mkdir -p "$BACKUP_DIR"
    mkdir -p "/var/log/bizabode-crm"
    mkdir -p "/opt/bizabode-crm/uploads"
    mkdir -p "/opt/bizabode-crm/logs"
    
    log_success "Directories created"
}

# Install system dependencies
install_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    apt-get update
    
    # Install Node.js 18.x
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    # Install PM2 for process management
    npm install -g pm2
    
    # Install MongoDB
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    apt-get update
    apt-get install -y mongodb-org
    
    # Install Nginx
    apt-get install -y nginx
    
    # Install Redis
    apt-get install -y redis-server
    
    # Install SSL tools
    apt-get install -y certbot python3-certbot-nginx
    
    log_success "Dependencies installed"
}

# Setup MongoDB
setup_mongodb() {
    log "Setting up MongoDB..."
    
    # Start MongoDB service
    systemctl start mongod
    systemctl enable mongod
    
    # Create database user
    mongosh --eval "
        use admin;
        db.createUser({
            user: 'bizabode_admin',
            pwd: '$(openssl rand -base64 32)',
            roles: [{ role: 'readWrite', db: 'bizabode-crm' }]
        });
    "
    
    log_success "MongoDB configured"
}

# Setup Redis
setup_redis() {
    log "Setting up Redis..."
    
    # Configure Redis
    sed -i 's/^# requirepass foobared/requirepass $(openssl rand -base64 32)/' /etc/redis/redis.conf
    
    # Start Redis service
    systemctl start redis-server
    systemctl enable redis-server
    
    log_success "Redis configured"
}

# Deploy application
deploy_app() {
    log "Deploying application..."
    
    # Backup current version if exists
    if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
        log "Creating backup of current version..."
        tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$APP_DIR" .
    fi
    
    # Copy application files
    cp -r . "$APP_DIR/"
    cd "$APP_DIR"
    
    # Install dependencies
    npm ci --production
    
    # Copy production environment
    cp config/production.env .env.local
    
    # Set proper permissions
    chown -R www-data:www-data "$APP_DIR"
    chmod -R 755 "$APP_DIR"
    
    log_success "Application deployed"
}

# Setup PM2 process manager
setup_pm2() {
    log "Setting up PM2 process manager..."
    
    # Create PM2 ecosystem file
    cat > "$APP_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/bizabode-crm/error.log',
    out_file: '/var/log/bizabode-crm/out.log',
    log_file: '/var/log/bizabode-crm/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
    
    # Start application with PM2
    pm2 start "$APP_DIR/ecosystem.config.js"
    pm2 save
    pm2 startup
    
    log_success "PM2 configured"
}

# Setup Nginx reverse proxy
setup_nginx() {
    log "Setting up Nginx reverse proxy..."
    
    # Create Nginx configuration
    cat > "$NGINX_CONFIG" << EOF
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL configuration (will be updated by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=upload:10m rate=1r/s;
    
    # API routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # File upload routes
    location /api/inventory/items/bulk-import {
        limit_req zone=upload burst=5 nodelay;
        client_max_body_size 10M;
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Static files
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/api/health;
    }
}
EOF
    
    # Enable site
    ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/
    
    # Test configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    log_success "Nginx configured"
}

# Setup SSL certificate
setup_ssl() {
    log "Setting up SSL certificate..."
    
    # Install SSL certificate with Let's Encrypt
    certbot --nginx -d yourdomain.com -d www.yourdomain.com --non-interactive --agree-tos --email admin@yourdomain.com
    
    # Setup auto-renewal
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log_success "SSL certificate configured"
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring script
    cat > "/opt/bizabode-crm/monitor.sh" << 'EOF'
#!/bin/bash

# Health check script
HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="/var/log/bizabode-crm/health.log"

# Check application health
response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [ "$response" != "200" ]; then
    echo "$(date): Health check failed - HTTP $response" >> "$LOG_FILE"
    
    # Restart application if unhealthy
    pm2 restart bizabode-crm
    
    # Send alert (customize as needed)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data '{"text":"Bizabode CRM is unhealthy and has been restarted"}' \
    #     YOUR_SLACK_WEBHOOK_URL
fi
EOF
    
    chmod +x "/opt/bizabode-crm/monitor.sh"
    
    # Setup cron job for monitoring
    echo "*/5 * * * * /opt/bizabode-crm/monitor.sh" | crontab -
    
    log_success "Monitoring configured"
}

# Setup backup
setup_backup() {
    log "Setting up backup system..."
    
    # Create backup script
    cat > "/opt/bizabode-crm/backup.sh" << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/bizabode-crm"
APP_DIR="/opt/bizabode-crm"
DATE=$(date +%Y%m%d-%H%M%S)

# Create backup
tar -czf "$BACKUP_DIR/app-$DATE.tar.gz" -C "$APP_DIR" .

# Backup database
mongodump --db bizabode-crm --out "$BACKUP_DIR/db-$DATE"

# Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "db-*" -mtime +30 -exec rm -rf {} \;
EOF
    
    chmod +x "/opt/bizabode-crm/backup.sh"
    
    # Setup daily backup
    echo "0 2 * * * /opt/bizabode-crm/backup.sh" | crontab -
    
    log_success "Backup system configured"
}

# Main deployment function
main() {
    log "Starting production deployment of Bizabode CRM..."
    
    check_root
    create_directories
    install_dependencies
    setup_mongodb
    setup_redis
    deploy_app
    setup_pm2
    setup_nginx
    setup_ssl
    setup_monitoring
    setup_backup
    
    log_success "Production deployment completed successfully!"
    log "Application is now running at: https://yourdomain.com"
    log "Health check: https://yourdomain.com/health"
    log "PM2 status: pm2 status"
    log "Logs: pm2 logs bizabode-crm"
}

# Run main function
main "$@"
