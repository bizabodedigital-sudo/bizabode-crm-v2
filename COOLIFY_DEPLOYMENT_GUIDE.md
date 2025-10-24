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

### Simplified Coolify Configuration
Use `docker-compose.coolify.yml` - Optimized for Coolify deployment:

```yaml
# Key features:
# - No port mapping (Coolify handles this)
# - No health checks (Coolify manages monitoring)
# - No restart policies (Coolify handles restarts)
# - No nginx/reverse proxy (Coolify uses Traefik)
# - Simple dependencies (Coolify manages service orchestration)
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

1. **Use the optimized docker-compose file**:
   - Use `docker-compose.coolify.yml` (simplified for Coolify)

2. **Set environment variables** in Coolify dashboard

3. **Deploy through Coolify**:
   - Coolify handles port mapping, SSL, and reverse proxy automatically
   - No need for manual port configuration
   - SSL certificates are auto-provisioned

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