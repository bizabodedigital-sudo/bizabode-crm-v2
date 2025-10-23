# Bizabode CRM - Production Deployment Guide

## 🚀 **PRODUCTION-READY INVENTORY SYSTEM**

This guide covers the complete production deployment of the Bizabode CRM system with enterprise-grade features.

---

## 📋 **Prerequisites**

### System Requirements
- **OS**: Ubuntu 20.04+ LTS or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Storage**: Minimum 50GB SSD
- **Network**: Static IP address, Domain name

### Software Requirements
- **Node.js**: 18.x LTS
- **MongoDB**: 6.0+
- **Redis**: 7.0+
- **Nginx**: 1.18+
- **PM2**: Latest
- **Docker**: 20.10+ (optional)

---

## 🔧 **Production Features Implemented**

### ✅ **Security**
- JWT authentication with secure tokens
- Rate limiting (100 requests/15min per IP)
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Security headers (HSTS, CSP, X-Frame-Options)
- File upload validation
- Request size limits

### ✅ **Performance**
- Connection pooling (MongoDB)
- Redis caching
- Gzip compression
- CDN-ready static assets
- Database indexing
- Query optimization
- Memory management
- Cluster mode (PM2)

### ✅ **Monitoring**
- Health check endpoints
- Performance metrics
- Error logging
- System monitoring
- Alert notifications
- Uptime tracking
- Response time monitoring

### ✅ **Reliability**
- Graceful shutdown handling
- Process management (PM2)
- Auto-restart on failure
- Database connection retry
- Error recovery
- Backup system
- Disaster recovery

### ✅ **Scalability**
- Horizontal scaling ready
- Load balancer compatible
- Database sharding support
- Microservices architecture
- Container orchestration
- Auto-scaling configuration

---

## 🚀 **Deployment Options**

### Option 1: Traditional Server Deployment

#### Quick Start
```bash
# Clone repository
git clone https://github.com/your-repo/bizabode-crm.git
cd bizabode-crm

# Run production deployment script
chmod +x scripts/deploy-production.sh
sudo ./scripts/deploy-production.sh
```

#### Manual Setup
```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y nodejs npm mongodb nginx redis-server

# 2. Setup application
npm ci --production
cp config/production.env .env.local

# 3. Configure services
sudo systemctl start mongodb redis-server nginx
sudo systemctl enable mongodb redis-server nginx

# 4. Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

#### Quick Start
```bash
# Copy environment file
cp config/production.env .env

# Start all services
docker-compose -f docker-compose.production.yml up -d

# Check status
docker-compose -f docker-compose.production.yml ps
```

#### Custom Configuration
```bash
# Build custom image
docker build -f Dockerfile.production -t bizabode-crm:latest .

# Run with custom settings
docker run -d \
  --name bizabode-crm \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://mongodb:27017/bizabode-crm \
  bizabode-crm:latest
```

---

## 🔐 **Security Configuration**

### Environment Variables
```bash
# Copy production environment
cp config/production.env .env.local

# Edit with your values
nano .env.local
```

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb://admin:password@localhost:27017/bizabode-crm
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
BCRYPT_ROUNDS=12

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### SSL Certificate Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 **Monitoring Setup**

### Health Check Endpoints
- **Application**: `https://yourdomain.com/api/health`
- **Database**: `https://yourdomain.com/api/health/database`
- **System**: `https://yourdomain.com/api/health/system`

### Monitoring Stack (Optional)
```bash
# Start monitoring services
docker-compose -f docker-compose.production.yml up -d prometheus grafana

# Access dashboards
# Prometheus: http://yourdomain.com:9090
# Grafana: http://yourdomain.com:3001
```

### Log Management
```bash
# View application logs
pm2 logs bizabode-crm

# View system logs
tail -f /var/log/bizabode-crm/app.log

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔄 **Backup & Recovery**

### Automated Backup
```bash
# Backup script runs daily at 2 AM
# Database backup: /opt/backups/bizabode-crm/db-*
# Application backup: /opt/backups/bizabode-crm/app-*

# Manual backup
/opt/bizabode-crm/backup.sh
```

### Recovery Process
```bash
# Stop application
pm2 stop bizabode-crm

# Restore database
mongorestore --db bizabode-crm /opt/backups/bizabode-crm/db-YYYYMMDD-HHMMSS/

# Restore application
tar -xzf /opt/backups/bizabode-crm/app-YYYYMMDD-HHMMSS.tar.gz -C /opt/bizabode-crm/

# Start application
pm2 start bizabode-crm
```

---

## 🚀 **Performance Optimization**

### Database Optimization
```bash
# Create indexes
mongo bizabode-crm --eval "
  db.items.createIndex({sku: 1, companyId: 1});
  db.items.createIndex({companyId: 1, category: 1});
  db.items.createIndex({companyId: 1, quantity: 1, reorderLevel: 1});
"
```

### Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### PM2 Optimization
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'bizabode-crm',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

---

## 🔧 **Maintenance**

### Regular Maintenance Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm update

# Restart services
pm2 restart bizabode-crm
sudo systemctl restart nginx

# Clean old logs
pm2 flush
sudo logrotate -f /etc/logrotate.d/bizabode-crm
```

### Health Monitoring
```bash
# Check application status
pm2 status
pm2 monit

# Check system resources
htop
df -h
free -h

# Check database status
mongo --eval "db.adminCommand('ping')"
```

---

## 🚨 **Troubleshooting**

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs bizabode-crm

# Check environment
pm2 env 0

# Restart with fresh environment
pm2 delete bizabode-crm
pm2 start ecosystem.config.js
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Check connection
mongo --eval "db.adminCommand('ping')"

# Restart MongoDB
sudo systemctl restart mongodb
```

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart bizabode-crm

# Check for memory leaks
node --inspect app.js
```

---

## 📈 **Scaling**

### Horizontal Scaling
```bash
# Add more PM2 instances
pm2 scale bizabode-crm 4

# Use load balancer
# Configure Nginx upstream
upstream app_servers {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
    server 127.0.0.1:3003;
}
```

### Database Scaling
```bash
# MongoDB replica set
# Configure sharding
# Use read replicas
```

---

## 🎯 **Production Checklist**

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database optimized
- [ ] Monitoring configured
- [ ] Backup system tested
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Error handling tested

### Post-Deployment
- [ ] Health checks passing
- [ ] Performance metrics normal
- [ ] All features working
- [ ] Monitoring alerts configured
- [ ] Backup system running
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Documentation updated

---

## 📞 **Support**

### Monitoring URLs
- **Application**: https://yourdomain.com
- **Health Check**: https://yourdomain.com/api/health
- **Prometheus**: http://yourdomain.com:9090
- **Grafana**: http://yourdomain.com:3001

### Log Locations
- **Application**: `/var/log/bizabode-crm/`
- **Nginx**: `/var/log/nginx/`
- **System**: `/var/log/syslog`

### Contact
- **Technical Support**: support@yourdomain.com
- **Emergency**: +1-XXX-XXX-XXXX
- **Documentation**: https://docs.yourdomain.com

---

## 🎉 **Success!**

Your Bizabode CRM system is now production-ready with:
- ✅ **Enterprise-grade security**
- ✅ **High-performance optimization**
- ✅ **Comprehensive monitoring**
- ✅ **Automated backups**
- ✅ **Scalable architecture**
- ✅ **Professional deployment**

**The system is ready for production use!** 🚀
