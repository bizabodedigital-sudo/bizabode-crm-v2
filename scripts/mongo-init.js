// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('bizabode_crm');

// Create application user
db.createUser({
  user: 'bizabode_user',
  pwd: 'bizabode_password',
  roles: [
    {
      role: 'readWrite',
      db: 'bizabode_crm'
    }
  ]
});

// Create initial collections with indexes
db.createCollection('users');
db.createCollection('companies');
db.createCollection('customers');
db.createCollection('leads');
db.createCollection('activities');
db.createCollection('salesorders');
db.createCollection('products');
db.createCollection('approvals');
db.createCollection('promotions');
db.createCollection('documents');
db.createCollection('creditlimits');
db.createCollection('tasks');
db.createCollection('suppliers');
db.createCollection('purchaseorders');
db.createCollection('employees');
db.createCollection('attendance');
db.createCollection('leaves');
db.createCollection('payroll');
db.createCollection('inventoryitems');
db.createCollection('inventorymovements');
db.createCollection('quotes');
db.createCollection('invoices');
db.createCollection('feedback');
db.createCollection('supporttickets');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "companyId": 1 });
db.companies.createIndex({ "name": 1 });
db.customers.createIndex({ "companyId": 1 });
db.customers.createIndex({ "email": 1 });
db.leads.createIndex({ "companyId": 1 });
db.leads.createIndex({ "status": 1 });
db.activities.createIndex({ "companyId": 1 });
db.activities.createIndex({ "createdAt": -1 });
db.salesorders.createIndex({ "companyId": 1 });
db.salesorders.createIndex({ "orderNumber": 1 });
db.products.createIndex({ "companyId": 1 });
db.products.createIndex({ "sku": 1 });
db.tasks.createIndex({ "companyId": 1 });
db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "status": 1 });
db.employees.createIndex({ "companyId": 1 });
db.employees.createIndex({ "employeeId": 1 });
db.attendance.createIndex({ "companyId": 1 });
db.attendance.createIndex({ "employeeId": 1 });
db.attendance.createIndex({ "date": 1 });
db.leaves.createIndex({ "companyId": 1 });
db.leaves.createIndex({ "employeeId": 1 });
db.leaves.createIndex({ "status": 1 });
db.payroll.createIndex({ "companyId": 1 });
db.payroll.createIndex({ "employeeId": 1 });
db.payroll.createIndex({ "payPeriod": 1 });
db.inventoryitems.createIndex({ "companyId": 1 });
db.inventoryitems.createIndex({ "sku": 1 });
db.inventoryitems.createIndex({ "category": 1 });
db.inventorymovements.createIndex({ "companyId": 1 });
db.inventorymovements.createIndex({ "itemId": 1 });
db.inventorymovements.createIndex({ "date": -1 });
db.quotes.createIndex({ "companyId": 1 });
db.quotes.createIndex({ "quoteNumber": 1 });
db.invoices.createIndex({ "companyId": 1 });
db.invoices.createIndex({ "invoiceNumber": 1 });
db.feedback.createIndex({ "companyId": 1 });
db.feedback.createIndex({ "createdAt": -1 });
db.supporttickets.createIndex({ "companyId": 1 });
db.supporttickets.createIndex({ "status": 1 });
db.supporttickets.createIndex({ "priority": 1 });

print('MongoDB initialization completed successfully!');