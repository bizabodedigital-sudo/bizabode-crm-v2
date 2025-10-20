# Bizabode CRM - VPS Deployment Guide

This guide will help you deploy Bizabode CRM on a VPS using Coolify or Docker.

## Prerequisites

- VPS with Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (for production)

## Quick Deployment with Coolify

### 1. Prepare Your VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply docker group changes
```

### 2. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/your-username/bizabode-crm.git
cd bizabode-crm

# Copy environment file
cp env.production.example .env

# Edit environment variables
nano .env
```

### 3. Configure Environment Variables

Edit the `.env` file with your production values:

```env
# Database
MONGODB_URI=mongodb://mongodb:27017/bizabode_crm
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_mongo_password
MONGO_DATABASE=bizabode_crm

# Authentication (IMPORTANT: Change these!)
JWT_SECRET=your_super_secure_jwt_secret_minimum_32_characters
NEXTAUTH_SECRET=your_nextauth_secret_minimum_32_characters
NEXTAUTH_URL=https://your-domain.com

# Application
PORT=3000
HOSTNAME=0.0.0.0
```

### 4. Deploy with Coolify

#### Option A: Using Coolify Dashboard

1. Connect your repository to Coolify
2. Select the `coolify.yml` configuration
3. Set environment variables in Coolify dashboard
4. Deploy

#### Option B: Manual Docker Deployment

```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 5. SSL Configuration (Production)

For production deployment with SSL:

```bash
# Create SSL directory
mkdir -p ssl

# Copy your SSL certificates
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem

# Update nginx.conf for SSL
# Edit nginx.conf to include SSL configuration
```

## Manual Docker Deployment

If you prefer manual deployment:

```bash
# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | Yes | - |
| `NEXTAUTH_SECRET` | NextAuth secret (min 32 chars) | Yes | - |
| `NEXTAUTH_URL` | Application URL | Yes | - |
| `PORT` | Application port | No | 3000 |
| `NODE_ENV` | Environment | No | production |

## Security Considerations

1. **Change all default passwords and secrets**
2. **Use strong, unique passwords**
3. **Enable SSL/TLS in production**
4. **Configure firewall rules**
5. **Regular security updates**

## Monitoring and Maintenance

### Health Check

The application includes a health check endpoint:
```
GET /api/health
```

### Logs

View application logs:
```bash
docker-compose logs -f bizabode-crm
```

View database logs:
```bash
docker-compose logs -f mongodb
```

### Backup

Backup MongoDB data:
```bash
docker-compose exec mongodb mongodump --out /backup
```

### Updates

To update the application:
```bash
git pull
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 443, and 3000 are available
2. **Permission issues**: Check file permissions for uploads and logs directories
3. **Database connection**: Verify MongoDB is running and accessible
4. **Environment variables**: Ensure all required variables are set

### Debug Commands

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs --tail=100

# Access container shell
docker-compose exec bizabode-crm sh

# Check database connection
docker-compose exec mongodb mongosh
```

## Performance Optimization

1. **Enable gzip compression** (configured in nginx.conf)
2. **Set up Redis for caching** (optional)
3. **Configure CDN** for static assets
4. **Monitor resource usage**

## Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all services are running
4. Check firewall and network configuration

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Log rotation configured
