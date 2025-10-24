# 🚀 Bizabode CRM - Coolify Deployment Guide

Complete guide to deploy the Bizabode CRM application on Coolify using Docker Compose.

## 📋 Prerequisites

- Coolify instance running
- Domain name (optional but recommended)
- SSL certificate (Coolify can auto-provision with Let's Encrypt)

## 🏗️ Project Structure

```
bizabode-crm/
├── Dockerfile.production          # Production-optimized Dockerfile
├── docker-compose.coolify.yml    # Coolify deployment configuration
├── env.coolify.template          # Environment variables template
├── COOLIFY_DEPLOYMENT_README.md  # This guide
└── [rest of your Next.js app]
```

## 🚀 Step-by-Step Deployment

### 1. Prepare Your Repository

1. **Clone or upload your project** to a Git repository
2. **Ensure these files are in the root directory:**
   - `Dockerfile.production`
   - `docker-compose.coolify.yml`
   - `env.coolify.template`

### 2. Create Coolify Project

1. **Login to Coolify Dashboard**
2. **Click "New Project"**
3. **Select "New Service"**
4. **Choose "Docker Compose"**

### 3. Configure Docker Compose

1. **Copy the contents of `docker-compose.coolify.yml`** into the Coolify editor
2. **Or connect your Git repository** and Coolify will auto-detect the compose file

### 4. Set Environment Variables

1. **Go to "Environment Variables" tab**
2. **Copy all variables from `env.coolify.template`**
3. **Update the values** with your actual configuration:

#### 🔐 Required Variables (Update These!)

```bash
# === CRITICAL - UPDATE THESE ===
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here
JWT_SECRET=your-jwt-secret-key-here
SESSION_SECRET=your-session-secret-key-here
MONGO_ROOT_PASSWORD=your-super-secure-mongodb-password

# === UPDATE YOUR DOMAIN ===
NEXTAUTH_URL=https://crm.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://crm.yourdomain.com/api
```

#### 📧 Optional Email Configuration

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

#### 📱 Optional WhatsApp Integration

```bash
WHATSAPP_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_ID=your-phone-id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your-webhook-verify-token
```

### 5. Deploy the Application

1. **Click "Deploy"**
2. **Wait for the build process** (5-10 minutes)
3. **Monitor the logs** for any errors

### 6. Configure Domain & SSL

1. **Go to "Domains" tab**
2. **Add your domain** (e.g., `crm.yourdomain.com`)
3. **Enable SSL** (Coolify will auto-provision Let's Encrypt)
4. **Wait for SSL certificate** to be issued

### 7. Verify Deployment

1. **Check application health:**
   ```
   https://yourdomain.com/api/health
   ```
   Should return: `{"status":"healthy","timestamp":"...","uptime":...}`

2. **Access the application:**
   ```
   https://yourdomain.com
   ```

3. **Login with default credentials:**
   - Email: `rojay@bizabode.com`
   - Password: `password123`

## 🔧 Post-Deployment Configuration

### 1. Create Admin User

1. **Access the application**
2. **Go to Settings → Users**
3. **Create your admin account**
4. **Delete or disable the default user**

### 2. Configure Company Settings

1. **Go to Settings → Company**
2. **Update company information**
3. **Upload company logo**
4. **Configure business settings**

### 3. Set Up Email (Optional)

1. **Go to Settings → Configuration**
2. **Configure SMTP settings**
3. **Test email sending**

### 4. Configure WhatsApp (Optional)

1. **Set up WhatsApp Business API**
2. **Add webhook URL:** `https://yourdomain.com/api/integrations/whatsapp`
3. **Configure webhook verification token**

## 📊 Monitoring & Maintenance

### Health Checks

- **Application:** `https://yourdomain.com/api/health`
- **Database:** MongoDB health check included
- **Redis:** Redis health check included

### Logs

- **View logs in Coolify dashboard**
- **Application logs:** Real-time application output
- **Database logs:** MongoDB operation logs
- **Redis logs:** Cache operation logs

### Backups

1. **MongoDB data** is persisted in Docker volumes
2. **File uploads** are persisted in uploads volume
3. **Configure automated backups** in Coolify

## 🛠️ Troubleshooting

### Common Issues

#### 1. Application Won't Start

**Check:**
- Environment variables are set correctly
- MongoDB and Redis are healthy
- Port 3000 is available

**Solution:**
```bash
# Check container logs
docker logs bizabode-crm2-app-1

# Check environment variables
docker exec bizabode-crm2-app-1 env
```

#### 2. Database Connection Issues

**Check:**
- MongoDB container is running
- Connection string is correct
- Database credentials are valid

**Solution:**
```bash
# Test MongoDB connection
docker exec bizabode-crm2-mongodb-1 mongosh --eval "db.adminCommand('ping')"
```

#### 3. File Upload Issues

**Check:**
- Uploads directory has correct permissions
- File size limits are appropriate
- Authentication is working

**Solution:**
```bash
# Check uploads directory
docker exec bizabode-crm2-app-1 ls -la /app/uploads
```

#### 4. SSL Certificate Issues

**Check:**
- Domain is pointing to Coolify
- DNS propagation is complete
- Let's Encrypt rate limits

**Solution:**
- Wait for DNS propagation
- Check domain configuration
- Retry SSL certificate generation

### Performance Optimization

1. **Enable Redis caching**
2. **Configure CDN** for static assets
3. **Set up monitoring** with Coolify metrics
4. **Configure auto-scaling** if needed

## 🔒 Security Considerations

### 1. Environment Variables

- **Use strong, unique passwords**
- **Rotate secrets regularly**
- **Never commit secrets to Git**

### 2. Database Security

- **Use strong MongoDB passwords**
- **Enable MongoDB authentication**
- **Restrict network access**

### 3. Application Security

- **Enable HTTPS only**
- **Configure CORS properly**
- **Set up rate limiting**
- **Regular security updates**

## 📈 Scaling

### Horizontal Scaling

1. **Add more app instances**
2. **Use load balancer**
3. **Configure session sharing**

### Vertical Scaling

1. **Increase container resources**
2. **Optimize database queries**
3. **Add caching layers**

## 🆘 Support

### Getting Help

1. **Check Coolify documentation**
2. **Review application logs**
3. **Test with minimal configuration**
4. **Contact support** if needed

### Useful Commands

```bash
# Check container status
docker ps

# View application logs
docker logs bizabode-crm2-app-1

# Access MongoDB
docker exec -it bizabode-crm2-mongodb-1 mongosh

# Access Redis
docker exec -it bizabode-crm2-redis-1 redis-cli

# Restart services
docker-compose restart
```

## ✅ Deployment Checklist

- [ ] Repository prepared with required files
- [ ] Coolify project created
- [ ] Docker Compose configured
- [ ] Environment variables set
- [ ] Application deployed
- [ ] Domain configured
- [ ] SSL certificate issued
- [ ] Health checks passing
- [ ] Admin user created
- [ ] Company settings configured
- [ ] Email configured (optional)
- [ ] WhatsApp configured (optional)
- [ ] Backups configured
- [ ] Monitoring set up

## 🎉 Success!

Your Bizabode CRM application is now running on Coolify with:

- ✅ **Production-ready Next.js application**
- ✅ **MongoDB database with persistence**
- ✅ **Redis caching**
- ✅ **File upload functionality**
- ✅ **SSL encryption**
- ✅ **Health monitoring**
- ✅ **Auto-scaling capabilities**

**Access your application at:** `https://yourdomain.com`

---

**Need help?** Check the troubleshooting section or contact support.
