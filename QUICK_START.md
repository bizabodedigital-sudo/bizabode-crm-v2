# 🚀 Bizabode CRM - Quick Start Guide

## Installation (5 minutes)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Your connection string:
MONGODB_URI=mongodb://localhost:27017/bizabode-crm
```

**Option B: MongoDB Atlas (Cloud - FREE)**

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create a cluster (takes 3-5 minutes)
4. Get connection string
5. Use in `.env.local`

### 3. Create Environment File

Create `.env.local` in the project root:

```env
# Required - Database
MONGODB_URI=mongodb://localhost:27017/bizabode-crm

# Required - JWT Secret (use any random string)
JWT_SECRET=my-super-secret-key-change-in-production-123456

# Optional - Email (for sending quotes/invoices)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_FROM=noreply@bizabode.com

# Optional - License API (use demo for testing)
LICENSE_API_URL=https://api.bizabode.com/v1/license
LICENSE_API_KEY=demo-key
```

### 4. Run the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 First Steps

### 1. Register Your First Account

1. Go to [http://localhost:3000/register](http://localhost:3000/register)
2. Fill in:
   - **Email**: admin@yourcompany.com
   - **Password**: yourpassword
   - **Name**: Your Name
   - **Company Name**: Your Company
   - **License Key**: demo-company-license

### 2. Explore the Dashboard

After registration, you'll see:

- **Dashboard**: Overview with KPIs and charts
- **Inventory**: Manage your products
- **CRM**: Leads → Opportunities → Quotes → Invoices
- **Deliveries**: Track shipments with QR codes

### 3. Add Your First Item

1. Go to **Inventory**
2. Click **Add Item**
3. Fill in:
   - SKU: PROD-001
   - Name: Test Product
   - Category: Electronics
   - Quantity: 100
   - Unit Price: $29.99

### 4. Create Your First Lead

1. Go to **CRM → Leads**
2. Click **Add Lead**
3. Fill in customer details
4. Click **Convert to Opportunity** when ready

### 5. Generate a Quote

1. Go to **CRM → Opportunities**
2. Open an opportunity
3. Click **Create Quote**
4. Add items from inventory
5. Download PDF or send via email

## 🔐 Demo Credentials

For quick testing with pre-populated data:

- **Email**: admin@bizabode.com
- **Password**: demo123
- **License Key**: demo-company-license

## 📱 User Roles

Your first account is automatically **Admin**. You can create more users with different roles:

- **Admin**: Full access
- **Manager**: CRM + Reports
- **Sales**: Leads, Opportunities, Quotes
- **Warehouse**: Inventory + Deliveries
- **Viewer**: Read-only access

## 🆘 Common Issues

### "Cannot connect to MongoDB"

✅ Make sure MongoDB is running: `brew services start mongodb-community`

### "JWT_SECRET is required"

✅ Add `JWT_SECRET=any-random-string` to `.env.local`

### Email not sending

✅ Email is optional. For Gmail:

1. Enable 2FA in Google Account
2. Generate App Password
3. Use in SMTP_PASSWORD

### Port 3000 already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

## 🎓 Learning Path

1. **Day 1**: Setup + Inventory Management
2. **Day 2**: CRM Basics (Leads → Opportunities)
3. **Day 3**: Quotes & Invoices
4. **Day 4**: Deliveries & QR Codes
5. **Day 5**: Reports & Analytics

## 📚 Next Steps

- Read full [README.md](./README.md) for complete API documentation
- Explore API routes in `/app/api`
- Customize UI components in `/components`
- Add custom fields to models in `/lib/models`

## 🔗 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://docs.mongodb.com)
- [shadcn/ui Components](https://ui.shadcn.com)
- [TailwindCSS](https://tailwindcss.com/docs)

---

**Need Help?** Open an issue or email support@bizabode.com
