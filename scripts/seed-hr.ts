// Seed HR data - employees, attendance, leave requests, and payroll
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") })

// Import models
import Company from "../lib/models/Company"
import User from "../lib/models/User"
import Employee from "../lib/models/Employee"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://root:examplepassword@localhost:27017/bizabode-crm?authSource=admin"

const employeeData = [
  {
    employeeId: "EMP001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@bizabode.com",
    phone: "+1-876-555-1001",
    address: {
      street: "123 Main Street",
      city: "Kingston",
      state: "St. Andrew",
      zipCode: "00001",
      country: "Jamaica"
    },
    position: "Sales Manager",
    department: "Sales",
    salary: 75000,
    hourlyRate: 36.06,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-01-15"),
    emergencyContact: {
      name: "Jane Smith",
      relationship: "Spouse",
      phone: "+1-876-555-1002",
      email: "jane.smith@email.com"
    },
    notes: "Experienced sales professional with excellent customer relationship skills."
  },
  {
    employeeId: "EMP002",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@bizabode.com",
    phone: "+1-876-555-1003",
    address: {
      street: "456 Oak Avenue",
      city: "Spanish Town",
      state: "St. Catherine",
      zipCode: "00002",
      country: "Jamaica"
    },
    position: "HR Specialist",
    department: "Human Resources",
    salary: 68000,
    hourlyRate: 32.69,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-02-20"),
    emergencyContact: {
      name: "Carlos Garcia",
      relationship: "Father",
      phone: "+1-876-555-1004",
      email: "carlos.garcia@email.com"
    },
    notes: "Skilled in employee relations and benefits administration."
  },
  {
    employeeId: "EMP003",
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@bizabode.com",
    phone: "+1-876-555-1005",
    address: {
      street: "789 Pine Street",
      city: "Portmore",
      state: "St. Catherine",
      zipCode: "00003",
      country: "Jamaica"
    },
    position: "Warehouse Supervisor",
    department: "Operations",
    salary: 55000,
    hourlyRate: 26.44,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-03-10"),
    emergencyContact: {
      name: "Linda Chen",
      relationship: "Mother",
      phone: "+1-876-555-1006",
      email: "linda.chen@email.com"
    },
    notes: "Excellent organizational skills and inventory management experience."
  },
  {
    employeeId: "EMP004",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@bizabode.com",
    phone: "+1-876-555-1007",
    address: {
      street: "321 Cedar Lane",
      city: "Mandeville",
      state: "Manchester",
      zipCode: "00004",
      country: "Jamaica"
    },
    position: "Accountant",
    department: "Finance",
    salary: 72000,
    hourlyRate: 34.62,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-04-01"),
    emergencyContact: {
      name: "Michael Johnson",
      relationship: "Brother",
      phone: "+1-876-555-1008",
      email: "michael.johnson@email.com"
    },
    notes: "CPA certified with expertise in financial reporting and compliance."
  },
  {
    employeeId: "EMP005",
    firstName: "Kevin",
    lastName: "Brown",
    email: "kevin.brown@bizabode.com",
    phone: "+1-876-555-1009",
    address: {
      street: "654 Elm Drive",
      city: "May Pen",
      state: "Clarendon",
      zipCode: "00005",
      country: "Jamaica"
    },
    position: "Delivery Driver",
    department: "Operations",
    salary: 42000,
    hourlyRate: 20.19,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-05-15"),
    emergencyContact: {
      name: "Patricia Brown",
      relationship: "Wife",
      phone: "+1-876-555-1010",
      email: "patricia.brown@email.com"
    },
    notes: "Reliable driver with clean driving record and excellent customer service."
  },
  {
    employeeId: "EMP006",
    firstName: "Lisa",
    lastName: "Williams",
    email: "lisa.williams@bizabode.com",
    phone: "+1-876-555-1011",
    address: {
      street: "987 Maple Court",
      city: "Ocho Rios",
      state: "St. Ann",
      zipCode: "00006",
      country: "Jamaica"
    },
    position: "Customer Service Representative",
    department: "Customer Service",
    salary: 38000,
    hourlyRate: 18.27,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-06-01"),
    emergencyContact: {
      name: "Robert Williams",
      relationship: "Father",
      phone: "+1-876-555-1012",
      email: "robert.williams@email.com"
    },
    notes: "Excellent communication skills and problem-solving abilities."
  },
  {
    employeeId: "EMP007",
    firstName: "James",
    lastName: "Miller",
    email: "james.miller@bizabode.com",
    phone: "+1-876-555-1013",
    address: {
      street: "147 Birch Street",
      city: "Montego Bay",
      state: "St. James",
      zipCode: "00007",
      country: "Jamaica"
    },
    position: "Marketing Assistant",
    department: "Marketing",
    salary: 45000,
    hourlyRate: 21.63,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-07-10"),
    emergencyContact: {
      name: "Jennifer Miller",
      relationship: "Sister",
      phone: "+1-876-555-1014",
      email: "jennifer.miller@email.com"
    },
    notes: "Creative professional with social media and content creation experience."
  },
  {
    employeeId: "EMP008",
    firstName: "Amanda",
    lastName: "Davis",
    email: "amanda.davis@bizabode.com",
    phone: "+1-876-555-1015",
    address: {
      street: "258 Willow Way",
      city: "Negril",
      state: "Westmoreland",
      zipCode: "00008",
      country: "Jamaica"
    },
    position: "IT Support Specialist",
    department: "Information Technology",
    salary: 58000,
    hourlyRate: 27.88,
    employmentType: "full-time",
    status: "active",
    hireDate: new Date("2023-08-20"),
    emergencyContact: {
      name: "Thomas Davis",
      relationship: "Husband",
      phone: "+1-876-555-1016",
      email: "thomas.davis@email.com"
    },
    notes: "Technical expertise in network administration and help desk support."
  }
]

async function seedHR() {
  try {
    console.log("🌱 Starting HR data seed...")

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Find demo company
    const company = await Company.findOne({ licenseKey: "demo-company-license" })
    if (!company) {
      console.error("❌ Demo company not found. Please run the main seed script first.")
      process.exit(1)
    }
    console.log("🏢 Found company:", company._id, company.name)

    // Find demo user
    const user = await User.findOne({ email: "admin@example.com" })
    if (!user) {
      console.error("❌ Demo user not found. Please run the main seed script first.")
      process.exit(1)
    }

    // Clear existing employees for this company
    await Employee.deleteMany({ companyId: company._id })
    console.log("🗑️  Cleared existing employees")

    // Create employees
    const employees = await Employee.insertMany(
      employeeData.map((emp) => ({
        ...emp,
        companyId: company._id,
        createdBy: user._id,
        isActive: true,
      }))
    )
    console.log(`✅ Created ${employees.length} employees`)

    console.log("\n🎉 HR data seeded successfully!")
    console.log("\n📊 Summary:")
    console.log(`   Employees: ${employees.length}`)
    console.log(`   Departments: ${[...new Set(employeeData.map(e => e.department))].length}`)
    console.log(`   Total Monthly Salary: $${employeeData.reduce((sum, e) => sum + e.salary, 0).toLocaleString()}`)
    console.log("\n🔗 Visit HR Module: http://localhost:3000/hr")

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error("❌ HR seed failed:", error)
    process.exit(1)
  }
}

seedHR()
