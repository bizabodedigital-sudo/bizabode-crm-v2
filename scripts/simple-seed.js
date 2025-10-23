const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27018/bizabode-crm?authSource=admin';

async function clearAndSeed() {
  try {
    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database');

    console.log('🗑️  Clearing all collections...');
    
    // Clear all collections
    const collections = [
      'users', 'companies', 'employees', 'items', 'leads', 
      'opportunities', 'quotes', 'invoices', 'payments', 
      'deliveries', 'payrolls', 'attendances', 'leaverequests'
    ];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
        console.log(`✅ Cleared ${collectionName} collection`);
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} not found or already empty`);
      }
    }

    console.log('🌱 Seeding database with sample data...');

    // 1. Create Company
    const company = {
      _id: new mongoose.Types.ObjectId(),
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
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await mongoose.connection.db.collection('companies').insertOne(company);
    console.log('✅ Created company:', company.name);

    // 2. Create Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Admin User',
      email: 'admin@bizabode.com',
      password: hashedPassword,
      role: 'admin',
      companyId: company._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const managerUser = {
      _id: new mongoose.Types.ObjectId(),
      name: 'John Manager',
      email: 'manager@bizabode.com',
      password: hashedPassword,
      role: 'manager',
      companyId: company._id,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await mongoose.connection.db.collection('users').insertMany([adminUser, managerUser]);
    console.log('✅ Created users: Admin & Manager');

    // 3. Create Employees
    const employees = [
      {
        _id: new mongoose.Types.ObjectId(),
        employeeId: 'EMP001',
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
        performanceRating: 8.5,
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        employeeId: 'EMP002',
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
        performanceRating: 9.0,
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        employeeId: 'EMP003',
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
        performanceRating: 7.5,
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('employees').insertMany(employees);
    console.log(`✅ Created ${employees.length} employees`);

    // 4. Create Inventory Items
    const items = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Laptop Computer - Dell Inspiron 15',
        description: 'High-performance laptop for business use',
        sku: 'LAP-DELL-15-001',
        category: 'Electronics',
        unitPrice: 85000,
        costPrice: 65000,
        quantity: 25,
        reorderLevel: 5,
        supplier: 'Tech Solutions Ltd',
        location: 'Warehouse A',
        isActive: true,
        critical: false,
        companyId: company._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Office Chair - Ergonomic',
        description: 'Comfortable ergonomic office chair',
        sku: 'CHAIR-ERG-001',
        category: 'Furniture',
        unitPrice: 25000,
        costPrice: 18000,
        quantity: 15,
        reorderLevel: 3,
        supplier: 'Furniture World',
        location: 'Warehouse B',
        isActive: true,
        critical: false,
        companyId: company._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Printer - HP LaserJet Pro',
        description: 'High-speed laser printer for office use',
        sku: 'PRINT-HP-LJ-001',
        category: 'Electronics',
        unitPrice: 45000,
        costPrice: 35000,
        quantity: 8,
        reorderLevel: 2,
        supplier: 'Office Supplies Co',
        location: 'Warehouse A',
        isActive: true,
        critical: false,
        companyId: company._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Desk - Executive Wood',
        description: 'Large executive wooden desk',
        sku: 'DESK-EXEC-001',
        category: 'Furniture',
        unitPrice: 75000,
        costPrice: 55000,
        quantity: 5,
        reorderLevel: 1,
        supplier: 'Furniture World',
        location: 'Warehouse B',
        isActive: true,
        critical: false,
        companyId: company._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('items').insertMany(items);
    console.log(`✅ Created ${items.length} inventory items`);

    // 5. Create Leads
    const leads = [
      {
        _id: new mongoose.Types.ObjectId(),
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
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
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
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('leads').insertMany(leads);
    console.log(`✅ Created ${leads.length} leads`);

    // 6. Create Opportunities
    const opportunities = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'Office Equipment Sale - ABC Corp',
        stage: 'proposal',
        value: 250000,
        probability: 75,
        expectedCloseDate: new Date('2024-02-15'),
        description: 'Bulk office equipment sale to ABC Corporation',
        leadId: leads[0]._id,
        assignedTo: managerUser._id,
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: 'IT Infrastructure - XYZ Ltd',
        stage: 'negotiation',
        value: 500000,
        probability: 60,
        expectedCloseDate: new Date('2024-03-01'),
        description: 'Complete IT infrastructure setup for XYZ Limited',
        leadId: leads[1]._id,
        assignedTo: managerUser._id,
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('opportunities').insertMany(opportunities);
    console.log(`✅ Created ${opportunities.length} opportunities`);

    // 7. Create Quotes
    const quotes = [
      {
        _id: new mongoose.Types.ObjectId(),
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
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('quotes').insertMany(quotes);
    console.log(`✅ Created ${quotes.length} quotes`);

    // 8. Create Invoices
    const invoices = [
      {
        _id: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-2024-001',
        customerName: 'ABC Corporation',
        customerEmail: 'contact@abccorp.com',
        customerPhone: '+1 (876) 555-0201',
        customerAddress: '123 Business Ave, Kingston, Jamaica',
        items: [
          {
            itemId: items[0]._id, // Reference to laptop item
            name: 'Laptop Computer - Dell Inspiron 15',
            description: 'High-performance laptop for business use',
            quantity: 5,
            unitPrice: 85000,
            total: 425000
          }
        ],
        subtotal: 425000,
        tax: 63750,
        taxRate: 15,
        total: 488750,
        status: 'sent',
        dueDate: new Date('2024-02-15'),
        notes: 'Payment due within 30 days',
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new mongoose.Types.ObjectId(),
        invoiceNumber: 'INV-2024-002',
        customerName: 'XYZ Limited',
        customerEmail: 'info@xyzlimited.com',
        customerPhone: '+1 (876) 555-0202',
        customerAddress: '456 Corporate Blvd, Kingston, Jamaica',
        items: [
          {
            itemId: items[1]._id, // Reference to office chair item
            name: 'Office Chair - Ergonomic',
            description: 'Comfortable ergonomic office chair',
            quantity: 10,
            unitPrice: 25000,
            total: 250000
          },
          {
            itemId: items[2]._id, // Reference to printer item
            name: 'Printer - HP LaserJet Pro',
            description: 'High-speed laser printer for office use',
            quantity: 2,
            unitPrice: 45000,
            total: 90000
          }
        ],
        subtotal: 340000,
        tax: 51000,
        taxRate: 15,
        total: 391000,
        status: 'draft',
        dueDate: new Date('2024-03-01'),
        notes: 'Bulk order discount applied',
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('invoices').insertMany(invoices);
    console.log(`✅ Created ${invoices.length} invoices`);

    // 9. Create Payments
    const payments = [
      {
        _id: new mongoose.Types.ObjectId(),
        invoiceId: invoices[0]._id,
        amount: 488750,
        paymentMethod: 'bank-transfer',
        paymentDate: new Date('2024-01-15'),
        reference: 'TXN-001-2024',
        notes: 'Full payment received',
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('payments').insertMany(payments);
    console.log(`✅ Created ${payments.length} payments`);

    // 10. Create Deliveries
    const deliveries = [
      {
        _id: new mongoose.Types.ObjectId(),
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
        driver: employees[2]._id, // Michael Brown - Driver
        notes: 'Delivered successfully',
        companyId: company._id,
        createdBy: adminUser._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('deliveries').insertMany(deliveries);
    console.log(`✅ Created ${deliveries.length} deliveries`);

    // 11. Create Payroll Records
    const payrolls = [
      {
        _id: new mongoose.Types.ObjectId(),
        employeeId: employees[0]._id,
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
        companyId: company._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('payrolls').insertMany(payrolls);
    console.log(`✅ Created ${payrolls.length} payroll records`);

    // 12. Create Attendance Records (sample for January 2024)
    const attendanceRecords = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0 && d.getDay() !== 6) { // Skip weekends
        for (const employee of employees) {
          attendanceRecords.push({
            _id: new mongoose.Types.ObjectId(),
            employeeId: employee._id,
            date: new Date(d),
            clockIn: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0),
            clockOut: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 17, 0),
            hoursWorked: 8,
            status: 'present',
            companyId: company._id,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }
    
    if (attendanceRecords.length > 0) {
      await mongoose.connection.db.collection('attendances').insertMany(attendanceRecords);
      console.log(`✅ Created ${attendanceRecords.length} attendance records`);
    }

    // 13. Create Leave Records
    const leaves = [
      {
        _id: new mongoose.Types.ObjectId(),
        employeeId: employees[0]._id,
        leaveType: 'vacation',
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-02-20'),
        days: 5,
        reason: 'Family vacation',
        status: 'approved',
        approvedBy: adminUser._id,
        companyId: company._id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await mongoose.connection.db.collection('leaverequests').insertMany(leaves);
    console.log(`✅ Created ${leaves.length} leave records`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- 1 Company: ${company.name}`);
    console.log(`- 2 Users: Admin & Manager`);
    console.log(`- ${employees.length} Employees`);
    console.log(`- ${items.length} Inventory Items`);
    console.log(`- ${leads.length} Leads`);
    console.log(`- ${opportunities.length} Opportunities`);
    console.log(`- ${quotes.length} Quotes`);
    console.log(`- ${invoices.length} Invoices`);
    console.log(`- ${payments.length} Payments`);
    console.log(`- ${deliveries.length} Deliveries`);
    console.log(`- ${payrolls.length} Payroll Records`);
    console.log(`- ${attendanceRecords.length} Attendance Records`);
    console.log(`- ${leaves.length} Leave Records`);

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin@bizabode.com / admin123');
    console.log('Manager: manager@bizabode.com / admin123');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Run the script
clearAndSeed();
