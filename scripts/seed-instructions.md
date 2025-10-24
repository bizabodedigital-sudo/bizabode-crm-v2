# Database Seeding Instructions

## Prerequisites

1. **MongoDB Running**: Ensure MongoDB is running on your system
   ```bash
   # Start MongoDB (choose your method)
   brew services start mongodb-community  # macOS with Homebrew
   sudo systemctl start mongod             # Linux
   # or run mongod directly
   ```

2. **Environment Variables**: Ensure your `.env.local` file has the correct MongoDB connection string
   ```env
   MONGODB_URI=mongodb://localhost:27017/bizabode-crm
   ```

## Running Comprehensive Seed Data

### Option 1: Full Comprehensive Seed
```bash
npm run db:seed:comprehensive
```

This creates realistic data for all modules:
- **Company**: Bizabode Demo Company
- **Users**: 4 users with different roles (admin, sales_manager, sales_rep, inventory_manager)
- **Inventory**: 6 items including low stock and out of stock scenarios
- **Suppliers**: 3 suppliers with different payment terms
- **Employees**: 3 employees in different departments
- **Customers**: 3 customers with different profiles
- **Leads**: 3 leads in different stages
- **Opportunities**: 2 opportunities in pipeline
- **Quotes**: 2 quotes (sent and draft)
- **Sales Orders**: 1 confirmed order
- **Invoices**: 2 invoices (one overdue)
- **Payments**: 1 partial payment
- **Deliveries**: 2 deliveries (scheduled and in-transit)
- **Activities**: 3 completed activities
- **Tasks**: 3 tasks (pending, in-progress, urgent)
- **Purchase Orders**: 1 pending PO
- **Notifications**: 4 notifications (low stock, overdue, out of stock, quote created)

### Option 2: Alternative MongoDB Setup

If you're using a different MongoDB setup (Docker, cloud, etc.), update the connection string in your environment variables:

```env
# For Docker
MONGODB_URI=mongodb://localhost:27017/bizabode-crm

# For MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bizabode-crm

# For custom MongoDB instance
MONGODB_URI=mongodb://your-host:your-port/bizabode-crm
```

## Test Credentials

After seeding, you can log in with these accounts:

- **Admin**: rojay@bizabode.com / password123
- **Sales Manager**: sarah@bizabode.com / password123  
- **Sales Rep**: mike@bizabode.com / password123
- **Inventory Manager**: emily@bizabode.com / password123

## What Gets Populated

### Dashboard Will Show:
- ✅ **Stock Items**: 6 items total (1 low stock, 1 out of stock)
- ✅ **Revenue**: $12,203.81 from quotes and invoices
- ✅ **Opportunities**: 2 active opportunities ($33,500 total value)
- ✅ **Activities**: Recent calls, meetings, and emails
- ✅ **Tasks**: 3 pending/in-progress tasks
- ✅ **Notifications**: 4 alerts (stock, overdue, quotes)
- ✅ **Charts**: Sales funnel with real data

### All Pages Will Have Data:
- **CRM**: Leads, opportunities, customers, quotes, orders, invoices, payments
- **Inventory**: Items with stock levels, low stock alerts
- **HR**: Employees, attendance records, payroll data
- **Procurement**: Suppliers, purchase orders
- **Deliveries**: Scheduled and in-transit deliveries
- **Reports**: Real data for all analytics and charts

## Troubleshooting

1. **Connection Refused**: Start MongoDB service
2. **Permission Denied**: Check MongoDB permissions
3. **Database Exists**: The script clears existing data (comment out clear section if needed)
4. **Import Errors**: Ensure all model files exist and are properly exported

## Manual Alternative

If the script fails, you can manually create data through the UI:
1. Register a company account
2. Add inventory items
3. Create customers and leads
4. Generate quotes and invoices
5. Log activities and create tasks

The comprehensive seed script creates a realistic business scenario for testing all features.
