# 🔧 Environment Setup - Self-Sufficient Configuration

This document explains the fully automated environment variable system for Bizabode CRM that works seamlessly with Docker and Coolify.

## 🎯 **Overview**

The application is designed to be **fully self-sufficient** when it comes to environment variables. It will automatically:

1. ✅ **Generate `.env` file** if it doesn't exist
2. ✅ **Create secure secrets** using crypto.randomBytes()
3. ✅ **Provide runtime fallbacks** for missing variables
4. ✅ **Validate critical variables** before startup
5. ✅ **Log safe confirmation messages** (never actual secrets)

## 🚀 **How It Works**

### **1. Auto Environment Initialization**

**File:** `scripts/init-env.ts`

- Checks if `.env` exists in project root
- If missing, generates one automatically with secure defaults
- Uses `crypto.randomBytes(32).toString('base64')` for secrets
- Logs safe confirmation messages

**Example Output:**
```
✅ Created .env with generated defaults
✅ Added JWT_SECRET and NEXTAUTH_SECRET
✅ Added SESSION_SECRET and MONGO_ROOT_PASSWORD
✅ Using default localhost URLs
✅ Configured database and Redis connections
✅ Set up security and performance defaults
```

### **2. Docker Integration**

**Updated Dockerfile:**
```dockerfile
# Initialize environment variables before build
RUN node scripts/init-env.ts

# Build the application
RUN corepack enable pnpm && pnpm run build
```

The `.env` file is baked into the container but ignored by Git.

### **3. Runtime Fallbacks**

**File:** `lib/env-runtime.ts`

Provides fallbacks for critical environment variables:

```typescript
process.env.JWT_SECRET ||= generateFallbackSecret();
process.env.NEXTAUTH_SECRET ||= generateFallbackSecret();
process.env.NEXT_PUBLIC_API_BASE_URL ||= 'http://localhost:3000';
```

### **4. Next.js Integration**

**Updated `next.config.js`:**
```javascript
// Initialize environment fallbacks before Next.js config
require('./lib/env-runtime');
```

**Middleware (`middleware.ts`):**
```typescript
// Initialize environment fallbacks on first request
import './lib/env-runtime';
```

## 📋 **Environment Variables**

### **Critical Variables (Auto-generated if missing):**
- `JWT_SECRET` - JWT token signing secret
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `SESSION_SECRET` - Session encryption secret
- `MONGO_ROOT_PASSWORD` - MongoDB admin password

### **Database Configuration:**
- `MONGODB_URI` - MongoDB connection string
- `MONGO_ROOT_USERNAME` - MongoDB admin username
- `MONGO_DATABASE` - Database name

### **API Configuration:**
- `NEXT_PUBLIC_API_BASE_URL` - Public API base URL
- `NEXTAUTH_URL` - NextAuth.js URL

### **Security Configuration:**
- `CORS_ORIGIN` - Allowed CORS origins
- `RATE_LIMIT_MAX` - Rate limiting max requests
- `RATE_LIMIT_WINDOW` - Rate limiting window (ms)

### **Optional Configuration:**
- `SMTP_*` - Email configuration
- `SENTRY_DSN` - Error monitoring
- `GOOGLE_ANALYTICS_ID` - Analytics tracking

## 🛠️ **Usage**

### **Development:**
```bash
# Environment will be auto-initialized on first run
npm run dev

# Or manually initialize
npm run env:init

# Check environment status
npm run env:check
```

### **Production with Docker:**
```bash
# Build with auto environment initialization
docker build -t bizabode-crm .

# Run with environment fallbacks
docker run -p 3000:3000 bizabode-crm
```

### **Production with Coolify:**
1. Deploy the application
2. Environment variables are auto-generated
3. Override specific variables in Coolify dashboard
4. App starts with secure defaults

## 🔐 **Security Features**

### **Secret Generation:**
- Uses `crypto.randomBytes(32).toString('base64')`
- Removes special characters for compatibility
- Generates 32-character secrets by default

### **Safe Logging:**
- Never logs actual secret values
- Only confirms that secrets were generated
- Provides helpful setup instructions

### **Validation:**
- Validates critical variables before startup
- Throws errors for missing required variables
- Provides clear error messages

## 📁 **File Structure**

```
bizabode-crm/
├── scripts/
│   ├── init-env.ts          # Auto environment initialization
│   └── startup.ts           # Startup validation
├── lib/
│   └── env-runtime.ts       # Runtime fallbacks
├── middleware.ts            # Environment initialization
├── next.config.js          # Next.js config with env init
├── env.example             # Environment template
└── .env                    # Generated environment file (ignored by git)
```

## 🚨 **Important Notes**

### **Security:**
- ✅ Never commit `.env` files to version control
- ✅ Generated secrets are cryptographically secure
- ✅ Runtime fallbacks use secure defaults
- ✅ No secrets are logged in console output

### **Coolify Integration:**
- ✅ Environment variables can be overridden in Coolify
- ✅ App starts with secure defaults if no overrides
- ✅ No manual `.env` file required
- ✅ Fully compatible with Coolify's environment system

### **Docker Compatibility:**
- ✅ Works with Docker Compose
- ✅ Works with standalone Docker
- ✅ Works with Kubernetes
- ✅ Works with any container orchestration

## 🔧 **Troubleshooting**

### **Environment Not Loading:**
```bash
# Check if .env exists
ls -la .env

# Manually initialize
npm run env:init

# Check environment status
npm run env:check
```

### **Missing Variables:**
- Check `lib/env-runtime.ts` for fallback values
- Verify variable names match exactly
- Ensure no typos in variable names

### **Docker Issues:**
- Ensure `scripts/init-env.ts` runs before build
- Check Docker logs for initialization messages
- Verify file permissions on scripts

## 🎉 **Benefits**

1. **🔒 Zero-Config Security** - Secure defaults out of the box
2. **🚀 One-Click Deploy** - No manual environment setup
3. **🛡️ Production Ready** - Secure secrets and validation
4. **📦 Docker Native** - Works seamlessly with containers
5. **☁️ Cloud Compatible** - Works with Coolify, Vercel, etc.
6. **🔧 Developer Friendly** - Clear logging and error messages

The system ensures your Bizabode CRM application is **always ready to deploy** with secure, production-ready defaults! 🎉
