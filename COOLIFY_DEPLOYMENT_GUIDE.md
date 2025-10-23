# Coolify Deployment Troubleshooting Guide

## Issues Identified

Your original Docker Compose configuration has several issues preventing app access:

### 1. **Port Exposure Problem**
- **Issue**: Using `expose: - "3000"` instead of `ports: - "3000:3000"`
- **Problem**: `expose` only makes ports available to other containers, not external traffic
- **Solution**: Use `ports` to map container port to host port

### 2. **Missing Nginx Service**
- **Issue**: Your nginx config files exist but no nginx service in docker-compose
- **Problem**: No reverse proxy to handle external requests
- **Solution**: Either add nginx service or use direct port mapping for Coolify

### 3. **Health Check Dependencies**
- **Issue**: App depends on MongoDB health but not Redis
- **Problem**: Inconsistent dependency management
- **Solution**: Add Redis health check dependency or remove strict health dependencies

## Recommended Solutions

### Option 1: Direct Port Mapping (Recommended for Coolify)
Use `docker-compose.simple.yml` - This is the simplest approach for Coolify:

```yaml
# Key changes:
ports:
  - "3000:3000"  # Instead of expose
depends_on:
  - mongodb      # Simple dependency, not health-based
  - redis
```

### Option 2: With Health Checks
Use `docker-compose.coolify.yml` - More robust but requires all services to be healthy:

```yaml
# Key changes:
ports:
  - "3000:3000"
depends_on:
  mongodb:
    condition: service_healthy
  redis:
    condition: service_healthy
```

## Environment Variables Required

Make sure these are set in Coolify:

```bash
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-mongo-password
MONGO_DATABASE=bizabode_crm
```

## Deployment Steps

1. **Use the corrected docker-compose file**:
   - For simple deployment: `docker-compose.simple.yml`
   - For production with health checks: `docker-compose.coolify.yml`

2. **Set environment variables** in Coolify dashboard

3. **Deploy and check logs**:
   ```bash
   # Check app logs
   docker-compose logs app
   
   # Check if app is responding
   curl http://localhost:3000/api/health
   ```

## Troubleshooting Commands

### Check if app is running:
```bash
docker ps
```

### Check app logs:
```bash
docker-compose logs -f app
```

### Test health endpoint:
```bash
curl http://localhost:3000/api/health
```

### Check MongoDB connection:
```bash
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Check Redis connection:
```bash
docker-compose exec redis redis-cli ping
```

## Common Issues

1. **App not accessible**: Check if port 3000 is properly exposed
2. **Health check failing**: MongoDB/Redis might not be ready - increase start_period
3. **Environment variables**: Ensure all required env vars are set in Coolify
4. **Database connection**: Check MongoDB URI and credentials

## Next Steps

1. Replace your current docker-compose.yml with one of the provided versions
2. Set all required environment variables in Coolify
3. Redeploy the application
4. Check the logs for any errors
5. Test the health endpoint to ensure the app is running