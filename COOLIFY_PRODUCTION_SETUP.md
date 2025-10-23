# 🚀 COOLIFY PRODUCTION ENVIRONMENT SETUP

## **BIZABODE CRM - PRODUCTION DEPLOYMENT ON COOLIFY**

This guide will help you deploy the Bizabode CRM system to production using Coolify with enterprise-grade features.

---

## **📋 PREREQUISITES**

### **Coolify Requirements**
- **Coolify Instance**: Running Coolify server
- **Domain**: Registered domain name
- **SSL Certificate**: Let's Encrypt or custom SSL
- **Resources**: Minimum 2GB RAM, 2 CPU cores, 20GB storage

### **Application Requirements**
- **Node.js**: 18.x LTS
- **MongoDB**: 6.0+ (external or containerized)
- **Redis**: 7.0+ (optional, for caching)
- **Nginx**: Reverse proxy and load balancer

---

## **🔧 COOLIFY CONFIGURATION**

### **1. Application Configuration**

#### **Basic Settings**
```yaml
# coolify.yml
version: '3.8'

services:
  bizabode-crm:
    build:
      context: .
      dockerfile: Dockerfile.production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - PORT=3000
      - HOSTNAME=0.0.0.0
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

#### **Production Dockerfile**
```dockerfile
# Dockerfile.production
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN npm install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

---

## **🌐 DOMAIN & SSL CONFIGURATION**

### **1. Domain Setup**
```bash
# Point your domain to Coolify server
# A record: yourdomain.com -> COOLIFY_SERVER_IP
# CNAME record: www.yourdomain.com -> yourdomain.com
```

### **2. SSL Certificate**
```bash
# Coolify will automatically handle SSL with Let's Encrypt
# Or configure custom SSL certificate in Coolify dashboard
```

### **3. Nginx Configuration**
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server bizabode-crm:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_proxied any;
        gzip_comp_level 6;
        gzip_types
            text/plain
            text/css
            text/xml
            text/javascript
            application/json
            application/javascript
            application/xml+rss
            application/atom+xml
            image/svg+xml;

        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Login endpoint rate limiting
        location /api/auth/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://app;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # Main application
        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

---

## **🗄️ DATABASE CONFIGURATION**

### **Option 1: External MongoDB (Recommended)**
```bash
# Use MongoDB Atlas or external MongoDB service
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bizabode_crm?retryWrites=true&w=majority
```

### **Option 2: Containerized MongoDB**
```yaml
# Add to coolify.yml
services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=${MONGO_DATABASE}
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  mongodb_data:
    driver: local
```

---

## **🔐 ENVIRONMENT VARIABLES**

### **Required Environment Variables**
```bash
# Database
MONGODB_URI=mongodb://mongodb:27017/bizabode_crm
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_password_here
MONGO_DATABASE=bizabode_crm

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
NEXTAUTH_SECRET=your_nextauth_secret_here_minimum_32_characters
NEXTAUTH_URL=https://yourdomain.com

# Application
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
```

---

## **🚀 DEPLOYMENT STEPS**

### **1. Coolify Dashboard Setup**

#### **Create New Application**
1. **Login to Coolify Dashboard**
2. **Click "New Application"**
3. **Select "Docker Compose"**
4. **Upload `coolify.yml` file**
5. **Configure environment variables**
6. **Set domain name**
7. **Enable SSL (Let's Encrypt)**

### **2. Environment Configuration**
```bash
# In Coolify dashboard, add these environment variables:
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/bizabode_crm
JWT_SECRET=your_super_secure_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://yourdomain.com
PORT=3000
HOSTNAME=0.0.0.0
```

### **3. Database Setup**
```bash
# If using external MongoDB:
# 1. Create MongoDB Atlas cluster
# 2. Get connection string
# 3. Update MONGODB_URI in Coolify

# If using containerized MongoDB:
# 1. Add MongoDB service to coolify.yml
# 2. Configure environment variables
# 3. Deploy with application
```

### **4. SSL Configuration**
```bash
# In Coolify dashboard:
# 1. Go to Application Settings
# 2. Enable "Let's Encrypt SSL"
# 3. Enter domain name
# 4. Save configuration
```

---

## **📊 MONITORING & HEALTH CHECKS**

### **Health Check Endpoints**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await connectDB()
    
    // Check system resources
    const memoryUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        external: memoryUsage.external
      },
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    })
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}
```

### **Monitoring Configuration**
```yaml
# Add to coolify.yml
services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  grafana_data:
    driver: local
```

---

## **🔄 BACKUP & RECOVERY**

### **Automated Backup Script**
```bash
#!/bin/bash
# backup.sh

# Database backup
mongodump --uri="$MONGODB_URI" --out="/backups/db-$(date +%Y%m%d-%H%M%S)"

# Application backup
tar -czf "/backups/app-$(date +%Y%m%d-%H%M%S).tar.gz" /app/uploads /app/logs

# Clean old backups (keep 7 days)
find /backups -name "db-*" -mtime +7 -delete
find /backups -name "app-*" -mtime +7 -delete
```

### **Recovery Process**
```bash
# Stop application
docker-compose down

# Restore database
mongorestore --uri="$MONGODB_URI" /backups/db-YYYYMMDD-HHMMSS/

# Restore application files
tar -xzf /backups/app-YYYYMMDD-HHMMSS.tar.gz -C /

# Start application
docker-compose up -d
```

---

## **🔧 MAINTENANCE**

### **Regular Maintenance Tasks**
```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Clean up
docker system prune -f
docker volume prune -f

# Check logs
docker-compose logs -f bizabode-crm
```

### **Performance Monitoring**
```bash
# Check resource usage
docker stats

# Check application health
curl https://yourdomain.com/api/health

# Check database status
mongo --eval "db.adminCommand('ping')"
```

---

## **🚨 TROUBLESHOOTING**

### **Common Issues**

#### **Application Won't Start**
```bash
# Check logs
docker-compose logs bizabode-crm

# Check environment variables
docker-compose config

# Restart services
docker-compose restart
```

#### **Database Connection Issues**
```bash
# Check MongoDB status
docker-compose logs mongodb

# Test connection
mongo --eval "db.adminCommand('ping')"

# Restart MongoDB
docker-compose restart mongodb
```

#### **SSL Certificate Issues**
```bash
# Check SSL status
curl -I https://yourdomain.com

# Renew certificate
certbot renew --nginx

# Check certificate expiry
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -text -noout
```

---

## **📈 SCALING**

### **Horizontal Scaling**
```yaml
# coolify.yml
services:
  bizabode-crm:
    # ... existing configuration
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### **Load Balancer Configuration**
```nginx
# nginx.conf
upstream app_servers {
    server bizabode-crm_1:3000;
    server bizabode-crm_2:3000;
    server bizabode-crm_3:3000;
}

server {
    # ... existing configuration
    location / {
        proxy_pass http://app_servers;
        # ... proxy configuration
    }
}
```

---

## **✅ PRODUCTION CHECKLIST**

### **Pre-Deployment**
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Database optimized
- [ ] Monitoring configured
- [ ] Backup system tested
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Error handling tested

### **Post-Deployment**
- [ ] Health checks passing
- [ ] Performance metrics normal
- [ ] All features working
- [ ] Monitoring alerts configured
- [ ] Backup system running
- [ ] Security scan completed
- [ ] Load testing performed
- [ ] Documentation updated

---

## **🎉 SUCCESS!**

Your Bizabode CRM system is now deployed to production on Coolify with:

- ✅ **Enterprise-grade security**
- ✅ **High-performance optimization**
- ✅ **Comprehensive monitoring**
- ✅ **Automated backups**
- ✅ **Scalable architecture**
- ✅ **Professional deployment**

**The system is ready for production use!** 🚀

### **Access URLs**
- **Application**: https://yourdomain.com
- **Health Check**: https://yourdomain.com/api/health
- **Monitoring**: https://yourdomain.com:3001 (Grafana)
- **Metrics**: https://yourdomain.com:9090 (Prometheus)

### **Default Login Credentials**
- **Admin Email**: admin@bizabodedigital.com
- **Admin Password**: demo123
- **Employee ID**: EMP001
- **Employee Password**: EMP001
