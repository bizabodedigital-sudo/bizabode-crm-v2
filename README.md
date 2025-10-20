# Bizabode CRM v2

A comprehensive CRM system built with Next.js 15, TypeScript, and MongoDB.

## 🚀 Quick Deployment with Coolify

This repository is configured for easy deployment with Coolify:

- **Dockerfile**: Production-ready container configuration
- **docker-compose.yml**: Complete stack with MongoDB and Nginx
- **coolify.yml**: Coolify-specific deployment configuration
- **nginx.conf**: Reverse proxy with security headers and rate limiting

## 📋 Deployment Files

- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Complete application stack
- `coolify.yml` - Coolify deployment configuration
- `nginx.conf` - Production Nginx configuration
- `deploy.sh` - Automated deployment script
- `DEPLOYMENT.md` - Comprehensive deployment guide

## 🔧 Environment Configuration

Copy `.env.production.full` to `.env` and configure your environment variables:

```bash
cp .env.production.full .env
# Edit .env with your production values
```

## 🛡️ Security Features

- JWT authentication with secure secrets
- Rate limiting and CORS protection
- Security headers and CSP
- Input validation with Zod schemas
- Password hashing with bcrypt

## 📊 Features

- **CRM**: Lead and opportunity management
- **Inventory**: Stock management and tracking
- **HR**: Employee management and payroll
- **Accounting**: Invoicing and financial tracking
- **Reports**: Analytics and reporting dashboard

## 🚀 Coolify Deployment

1. Connect this repository to Coolify
2. Use the `coolify.yml` configuration
3. Set environment variables in Coolify dashboard
4. Deploy!

## 📖 Documentation

See `DEPLOYMENT.md` for detailed deployment instructions.

## 🔗 Repository

- **GitHub**: https://github.com/bizabodedigital-sudo/bizabode-crm-v2.git
- **Branch**: master (main deployment branch)