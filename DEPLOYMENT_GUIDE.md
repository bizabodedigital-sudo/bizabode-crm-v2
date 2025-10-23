# Bizabode CRM - Deployment Guide

## 🚀 Quick Start with Docker Compose

### Prerequisites

- Docker and Docker Compose installed
- Git installed
- At least 2GB RAM available
- Ports 80, 443, 3000, 27017, 6379 available

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bizabode-crm.git
cd bizabode-crm
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.production.example .env

# Edit environment variables
nano .env
```

**Required Environment Variables:**
```env
# Database Configuration
MONGODB_URI=mongodb://mongodb:27017/bizabode_crm
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DATABASE=bizabode_crm

# Application Configuration
NODE_ENV=production
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Deploy with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
```

### 4. Verify Deployment

```bash
# Check health endpoint
curl http://localhost:3000/api/health

# Access the application
open http://localhost:3000
```

## 🐳 Docker Services

### Application (app)
- **Port:** 3000
- **Health Check:** `/api/health`
- **Restart Policy:** unless-stopped

### MongoDB (mongodb)
- **Port:** 27017
- **Data Volume:** `mongodb_data`
- **Initialization:** Automatic with indexes

### Redis (redis)
- **Port:** 6379
- **Data Volume:** `redis_data`
- **Purpose:** Caching and sessions

### Nginx (nginx)
- **Ports:** 80, 443
- **Purpose:** Reverse proxy and SSL termination

## 🔧 Production Configuration

### SSL/HTTPS Setup

1. **Generate SSL certificates:**
```bash
mkdir ssl
# Add your SSL certificates to ./ssl/ directory
```

2. **Update nginx.conf for SSL:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

### Environment-Specific Configurations

#### Development
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

#### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 📊 Monitoring & Maintenance

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis health
docker-compose exec redis redis-cli ping
```

### Logs Management

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs mongodb
docker-compose logs nginx

# Follow logs in real-time
docker-compose logs -f app
```

### Backup & Restore

#### Database Backup
```bash
# Create backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d_%H%M%S)

# Copy backup from container
docker cp $(docker-compose ps -q mongodb):/backup ./backups/
```

#### Database Restore
```bash
# Restore from backup
docker-compose exec mongodb mongorestore /backup/20240101_120000
```

## 🚀 GitHub Deployment

### 1. Create GitHub Repository

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit: Bizabode CRM with Docker setup"

# Add remote repository
git remote add origin https://github.com/yourusername/bizabode-crm.git
git branch -M main
git push -u origin main
```

### 2. GitHub Actions CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          # Add your deployment commands here
          echo "Deploying to production server..."
```

### 3. Environment Secrets

Add these secrets to your GitHub repository:

- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_API_BASE_URL`

## 🔒 Security Considerations

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique secrets
- Rotate secrets regularly

### 2. Database Security
- Change default MongoDB credentials
- Enable authentication
- Use network isolation

### 3. Application Security
- Enable HTTPS in production
- Use secure headers
- Implement rate limiting

## 📈 Scaling & Performance

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  app:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
```

### Load Balancing

```nginx
upstream app_servers {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    location / {
        proxy_pass http://app_servers;
    }
}
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
# Kill process using port
sudo kill -9 $(lsof -t -i:3000)
```

#### 2. Database Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### 3. Application Won't Start
```bash
# Check application logs
docker-compose logs app

# Rebuild application
docker-compose build --no-cache app
docker-compose up -d app
```

### Performance Optimization

#### 1. Database Indexes
```bash
# Connect to MongoDB
docker-compose exec mongodb mongosh

# Check indexes
use bizabode_crm
db.customers.getIndexes()
```

#### 2. Application Monitoring
```bash
# Monitor resource usage
docker stats

# Check container health
docker-compose ps
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MongoDB Docker](https://hub.docker.com/_/mongo)
- [Nginx Configuration](https://nginx.org/en/docs/)

## 🆘 Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all ports are available
4. Check Docker and Docker Compose versions

---

**Happy Deploying! 🚀**