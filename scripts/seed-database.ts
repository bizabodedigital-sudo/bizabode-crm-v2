import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import models
import User from '../lib/models/User';
import Company from '../lib/models/Company';
import Employee from '../lib/models/Employee';
import Item from '../lib/models/Item';
import Lead from '../lib/models/Lead';
import Opportunity from '../lib/models/Opportunity';
import Quote from '../lib/models/Quote';
import Invoice from '../lib/models/Invoice';
import Payment from '../lib/models/Payment';
import Delivery from '../lib/models/Delivery';
import Payroll from '../lib/models/Payroll';
import Attendance from '../lib/models/Attendance';
import LeaveRequest from '../lib/models/LeaveRequest';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bizabode-crm';

async function clearDatabase() {
  console.log('🗑️  Clearing database...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Clear all collections
    const collections = [
      'users', 'companies', 'employees', 'items', 'leads', 
      'opportunities', 'quotes', 'invoices', 'payments', 
      'deliveries', 'payrolls', 'attendances', 'leaverequests'
    ];
    
    for (const collection of collections) {
      await mongoose.connection.db?.collection(collection).deleteMany({});
      console.log(`✅ Cleared ${collection} collection`);
    }
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');
  
  try {
    // 1. Create Company
    const company = new Company({
      name: 'Bizabode Solutions Ltd',
      licenseKey: 'BZ-2024-ENT-001',
      licensePlan: 'enterprise',
      licenseExpiry: new Date('2025-12-31'),
      licenseStatus: 'active',
      address: '123 Business Street, Kingston, Jamaica',
      phone: '+1 (876) 555-0123',
      email: 'info@bizabode.com',
      website: 'https://bizabode.com',
      settings: {
        currency: 'JMD',
        taxRate: 15,
        timezone: 'America/Jamaica'
      }
    });
    await company.save();
    console.log('✅ Created company:', company.name);

    // 2. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      companyId: company._id,
      isActive: true
    });
    await adminUser.save();
    console.log('✅ Created admin user:', adminUser.email);

    // 3. Create Manager User
    const managerUser = new User({
      name: 'John Manager',
      email: 'manager@bizabode.com',
      password: hashedPassword,
      role: 'manager',
      companyId: company._id,
      isActive: true
    });
    await managerUser.save();
    console.log('✅ Created manager user:', managerUser.email);

    // 4. Create Employees
    const employees = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@bizabode.com',
        phone: '+1 (876) 555-0101',
        position: 'Sales Manager',
        department: 'Sales',
        employmentType: 'full-time',
        salary: 75000,
        hourlyRate: 36.06,
        status: 'active',
        hireDate: new Date('2023-01-15'),
        address: '456 Employee Ave, Kingston, Jamaica',
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '+1 (876) 555-0102',
          email: 'jane.smith@email.com'
        },
        trn: '123456789',
        nisNumber: 'NIS-123456',
        nhtNumber: 'NHT-123456',
        gender: 'male',
        maritalStatus: 'married',
        dateOfBirth: new Date('1985-05-15'),
        payFrequency: 'monthly',
        paymentMethod: 'bank-transfer',
        bankName: 'National Commercial Bank',
        bankAccountNumber: '1234567890',
        workLocation: 'Kingston Office',
        workSchedule: 'Mon-Fri 9AM-5PM',
        performanceRating: 8.5
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@bizabode.com',
        phone: '+1 (876) 555-0103',
        position: 'HR Specialist',
        department: 'Human Resources',
        employmentType: 'full-time',
        salary: 65000,
        hourlyRate: 31.25,
        status: 'active',
        hireDate: new Date('2023-03-01'),
        address: '789 HR Street, Kingston, Jamaica',
        emergencyContact: {
          name: 'Mike Johnson',
          relationship: 'Brother',
          phone: '+1 (876) 555-0104',
          email: 'mike.johnson@email.com'
        },
        trn: '987654321',
        nisNumber: 'NIS-654321',
        nhtNumber: 'NHT-654321',
        gender: 'female',
        maritalStatus: 'single',
        dateOfBirth: new Date('1990-08-22'),
        payFrequency: 'monthly',
        paymentMethod: 'bank-transfer',
        bankName: 'Scotiabank',
        bankAccountNumber: '0987654321',
        workLocation: 'Kingston Office',
        workSchedule: 'Mon-Fri 8AM-4PM',
        performanceRating: 9.0
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@bizabode.com',
        phone: '+1 (876) 555-0105',
        position: 'Delivery Driver',
        department: 'Operations',
        employmentType: 'full-time',
        salary: 42000,
        hourlyRate: 20.19,
        status: 'active',
        hireDate: new Date('2023-06-01'),
        address: '321 Driver Lane, Spanish Town, Jamaica',
        emergencyContact: {
          name: 'Lisa Brown',
          relationship: 'Sister',
          phone: '+1 (876) 555-0106',
          email: 'lisa.brown@email.com'
        },
        trn: '456789123',
        nisNumber: 'NIS-456789',
        nhtNumber: 'NHT-456789',
        gender: 'male',
        maritalStatus: 'single',
        dateOfBirth: new Date('1988-12-10'),
        payFrequency: 'bi-weekly',
        paymentMethod: 'bank-transfer',
        bankName: 'First National Bank',
        bankAccountNumber: '4567891230',
        workLocation: 'Spanish Town Warehouse',
        workSchedule: 'Mon-Sat 7AM-3PM',
        performanceRating: 7.5
      }
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const employee = new Employee({
        ...empData,
        companyId: company._id,
        createdBy: adminUser._id
      });
      await employee.save();
      createdEmployees.push(employee);
      console.log(`✅ Created employee: ${employee.firstName} ${employee.lastName}`);
    }

    // 5. Create Inventory Items
    const items = [
      {
        name: 'Laptop Computer - Dell Inspiron 15',
        description: 'High-performance laptop for business use',
        sku: 'LAP-DELL-15-001',
        category: 'Electronics',
        price: 85000,
        cost: 65000,
        stockQuantity: 25,
        minStockLevel: 5,
        supplier: 'Tech Solutions Ltd',
        location: 'Warehouse A',
        companyId: company._id
      },
      {
        name: 'Office Chair - Ergonomic',
        description: 'Comfortable ergonomic office chair',
        sku: 'CHAIR-ERG-001',
        category: 'Furniture',
        price: 25000,
        cost: 18000,
        stockQuantity: 15,
        minStockLevel: 3,
        supplier: 'Furniture World',
        location: 'Warehouse B',
        companyId: company._id
      },
      {
        name: 'Printer - HP LaserJet Pro',
        description: 'High-speed laser printer for office use',
        sku: 'PRINT-HP-LJ-001',
        category: 'Electronics',
        price: 45000,
        cost: 35000,
        stockQuantity: 8,
        minStockLevel: 2,
        supplier: 'Office Supplies Co',
        location: 'Warehouse A',
        companyId: company._id
      },
      {
        name: 'Desk - Executive Wood',
        description: 'Large executive wooden desk',
        sku: 'DESK-EXEC-001',
        category: 'Furniture',
        price: 75000,
        cost: 55000,
        stockQuantity: 5,
        minStockLevel: 1,
        supplier: 'Furniture World',
        location: 'Warehouse B',
        companyId: company._id
      }
    ];

    const createdItems = [];
    for (const itemData of items) {
      const item = new Item(itemData);
      await item.save();
      createdItems.push(item);
      console.log(`✅ Created item: ${item.name}`);
    }

    // 6. Create Leads
    const leads = [
      {
        name: 'ABC Corporation',
        email: 'contact@abccorp.com',
        phone: '+1 (876) 555-0201',
        company: 'ABC Corporation',
        source: 'Website',
        status: 'new',
        priority: 'high',
        notes: 'Interested in bulk office supplies',
        assignedTo: managerUser._id,
        companyId: company._id,
        createdBy: adminUser._id
      },
      {
        name: 'XYZ Limited',
        email: 'info@xyzlimited.com',
        phone: '+1 (876) 555-0202',
        company: 'XYZ Limited',
        source: 'Referral',
        status: 'contacted',
        priority: 'medium',
        notes: 'Looking for IT equipment',
        assignedTo: managerUser._id,
        companyId: company._id,
        createdBy: adminUser._id
      }
    ];

    const createdLeads = [];
    for (const leadData of leads) {
      const lead = new Lead(leadData);
      await lead.save();
      createdLeads.push(lead);
      console.log(`✅ Created lead: ${lead.name}`);
    }

    // 7. Create Opportunities
    const opportunities = [
      {
        name: 'Office Equipment Sale - ABC Corp',
        stage: 'proposal',
        value: 250000,
        probability: 75,
        expectedCloseDate: new Date('2024-02-15'),
        description: 'Bulk office equipment sale to ABC Corporation',
        leadId: createdLeads[0]._id,
        assignedTo: managerUser._id,
        companyId: company._id,
        createdBy: adminUser._id
      },
      {
        name: 'IT Infrastructure - XYZ Ltd',
        stage: 'negotiation',
        value: 500000,
        probability: 60,
        expectedCloseDate: new Date('2024-03-01'),
        description: 'Complete IT infrastructure setup for XYZ Limited',
        leadId: createdLeads[1]._id,
        assignedTo: managerUser._id,
        companyId: company._id,
        createdBy: adminUser._id
      }
    ];

    const createdOpportunities = [];
    for (const oppData of opportunities) {
      const opportunity = new Opportunity(oppData);
      await opportunity.save();
      createdOpportunities.push(opportunity);
      console.log(`✅ Created opportunity: ${opportunity.name}`);
    }

    // 8. Create Quotes
    const quotes = [
      {
        quoteNumber: 'QUO-2024-001',
        customerName: 'ABC Corporation',
        customerEmail: 'contact@abccorp.com',
        customerPhone: '+1 (876) 555-0201',
        customerAddress: '123 Business Ave, Kingston, Jamaica',
        items: [
          {
            name: 'Laptop Computer - Dell Inspiron 15',
            description: 'High-performance laptop for business use',
            quantity: 10,
            unitPrice: 85000,
            total: 850000
          },
          {
            name: 'Office Chair - Ergonomic',
            description: 'Comfortable ergonomic office chair',
            quantity: 20,
            unitPrice: 25000,
            total: 500000
          }
        ],
        subtotal: 1350000,
        taxRate: 15,
        taxAmount: 202500,
        total: 1552500,
        status: 'sent',
        validUntil: new Date('2024-02-28'),
        notes: 'Bulk discount applied',
        companyId: company._id,
        createdBy: adminUser._id
      }
    ];

    const createdQuotes = [];
    for (const quoteData of quotes) {
      const quote = new Quote(quoteData);
      await quote.save();
      createdQuotes.push(quote);
      console.log(`✅ Created quote: ${quote.quoteNumber}`);
    }

    // 9. Create Invoices
    const invoices = [
      {
        invoiceNumber: 'INV-2024-001',
        customerName: 'ABC Corporation',
        customerEmail: 'contact@abccorp.com',
        customerPhone: '+1 (876) 555-0201',
        customerAddress: '123 Business Ave, Kingston, Jamaica',
        items: [
          {
            name: 'Laptop Computer - Dell Inspiron 15',
            description: 'High-performance laptop for business use',
            quantity: 5,
            unitPrice: 85000,
            total: 425000
          }
        ],
        subtotal: 425000,
        taxRate: 15,
        taxAmount: 63750,
        total: 488750,
        status: 'sent',
        dueDate: new Date('2024-02-15'),
        notes: 'Payment due within 30 days',
        companyId: company._id,
        createdBy: adminUser._id
      }
    ];

    const createdInvoices = [];
    for (const invoiceData of invoices) {
      const invoice = new Invoice(invoiceData);
      await invoice.save();
      createdInvoices.push(invoice);
      console.log(`✅ Created invoice: ${invoice.invoiceNumber}`);
    }

    // 10. Create Payments
    const payments = [
      {
        invoiceId: createdInvoices[0]._id,
        amount: 488750,
        paymentMethod: 'bank-transfer',
        paymentDate: new Date('2024-01-15'),
        reference: 'TXN-001-2024',
        notes: 'Full payment received',
        companyId: company._id,
        createdBy: adminUser._id
      }
    ];

    for (const paymentData of payments) {
      const payment = new Payment(paymentData);
      await payment.save();
      console.log(`✅ Created payment: ${payment.reference}`);
    }

    // 11. Create Deliveries
    const deliveries = [
      {
        deliveryNumber: 'DEL-2024-001',
        customerName: 'ABC Corporation',
        customerAddress: '123 Business Ave, Kingston, Jamaica',
        customerPhone: '+1 (876) 555-0201',
        items: [
          {
            name: 'Laptop Computer - Dell Inspiron 15',
            quantity: 5
          }
        ],
        status: 'delivered',
        deliveryDate: new Date('2024-01-16'),
        driver: createdEmployees[2]._id, // Michael Brown - Driver
        notes: 'Delivered successfully',
        companyId: company._id,
        createdBy: adminUser._id
      }
    ];

    for (const deliveryData of deliveries) {
      const delivery = new Delivery(deliveryData);
      await delivery.save();
      console.log(`✅ Created delivery: ${delivery.deliveryNumber}`);
    }

    // 12. Create Payroll Records
    const payrolls = [
      {
        employeeId: createdEmployees[0]._id,
        payPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        items: [
          {
            type: 'earning',
            description: 'Basic Salary',
            amount: 75000
          },
          {
            type: 'deduction',
            description: 'Income Tax',
            amount: 15000
          },
          {
            type: 'deduction',
            description: 'NIS Contribution',
            amount: 3750
          }
        ],
        grossPay: 75000,
        totalDeductions: 18750,
        netPay: 56250,
        status: 'paid',
        paymentDate: new Date('2024-02-01'),
        processedBy: adminUser._id,
        companyId: company._id
      }
    ];

    for (const payrollData of payrolls) {
      const payroll = new Payroll(payrollData);
      await payroll.save();
      console.log(`✅ Created payroll record for: ${payroll.employeeId}`);
    }

    // 13. Create Attendance Records
    const attendanceRecords = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
        for (const employee of createdEmployees) {
          const attendance = new Attendance({
            employeeId: employee._id,
            date: new Date(d),
            clockIn: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0),
            clockOut: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 17, 0),
            hoursWorked: 8,
            status: 'present',
            companyId: company._id
          });
          await attendance.save();
          attendanceRecords.push(attendance);
        }
      }
    }
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    // 14. Create Leave Records
    const leaves = [
      {
        employeeId: createdEmployees[0]._id,
        leaveType: 'vacation',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-20'),
        days: 5,
        reason: 'Family vacation',
        status: 'approved',
        approvedBy: adminUser._id,
        companyId: company._id
      }
    ];

    for (const leaveData of leaves) {
      const leave = new LeaveRequest(leaveData);
      await leave.save();
      console.log(`✅ Created leave record for: ${leave.employeeId}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 Company: ${company.name}`);
    console.log(`- 2 Users: Admin & Manager`);
    console.log(`- ${createdEmployees.length} Employees`);
    console.log(`- ${createdItems.length} Inventory Items`);
    console.log(`- ${createdLeads.length} Leads`);
    console.log(`- ${createdOpportunities.length} Opportunities`);
    console.log(`- ${createdQuotes.length} Quotes`);
    console.log(`- ${createdInvoices.length} Invoices`);
    console.log(`- ${payments.length} Payments`);
    console.log(`- ${deliveries.length} Deliveries`);
    console.log(`- ${payrolls.length} Payroll Records`);
    console.log(`- ${attendanceRecords.length} Attendance Records`);
    console.log(`- ${leaves.length} Leave Records`);

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Manager: manager@example.com / admin123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

async function main() {
  try {
    await clearDatabase();
    await seedDatabase();
    console.log('\n✅ Database reset and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { clearDatabase, seedDatabase };
