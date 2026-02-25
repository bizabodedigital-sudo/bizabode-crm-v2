// Seed script to populate database with initial data
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") })

// Import models
import Company from "../lib/models/Company"
import User from "../lib/models/User"
import Item from "../lib/models/Item"
import Lead from "../lib/models/Lead"
import Opportunity from "../lib/models/Opportunity"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://root:examplepassword@localhost:27017/bizabode-crm?authSource=admin"

const inventoryData = [
  {
    sku: "28OZ-BB-CONT",
    name: "28OZ B/BASE CONTAINER",
    description: "28OZ MICROWAVABLE BLACKBASE CONTAINER (8X25) FAKPAK",
    category: "Containers",
    quantity: 0,
    reorderLevel: 50,
    unitPrice: 9427.18,
    costPrice: 7500.00,
  },
  {
    sku: "SC-003",
    name: "SOUP CUP PAPER 24OZ",
    description: "SOUP CUP PAPER 24OZ [20*25] QUALITY",
    category: "Cups & Containers",
    quantity: 44,
    reorderLevel: 20,
    unitPrice: 9482.55,
    costPrice: 7500.00,
  },
  {
    sku: "DHT-36-100",
    name: "HAND TOWEL SOPHIE",
    description: "HAND TOWEL SOPHIE 36*100SHTS",
    category: "Paper Products",
    quantity: 2,
    reorderLevel: 10,
    unitPrice: 9498.10,
    costPrice: 7500.00,
  },
  {
    sku: "SC-LC-02",
    name: "SOUP CUP PAPER 16OZ",
    description: "SOUP CUP PAPER 160Z 500PCS (NO BRAND)",
    category: "Cups & Containers",
    quantity: 8,
    reorderLevel: 20,
    unitPrice: 9500.00,
    costPrice: 7500.00,
  },
  {
    sku: "HTJ-1000FT",
    name: "JUMBO HAND TOWEL 1000FT",
    description: "JUMBO HAND TOWEL 1000FT 1PLY 6CT (ME10)",
    category: "Paper Products",
    quantity: 19,
    reorderLevel: 10,
    unitPrice: 9709.20,
    costPrice: 7500.00,
  },
  {
    sku: "LB-2-LC-02",
    name: "LUNCH BOX KRAFT #2",
    description: "LUNCH BOX KRAFT #2 [4*50CT] 1400ML BIONATURE",
    category: "Lunch Boxes",
    quantity: 0,
    reorderLevel: 25,
    unitPrice: 9720.00,
    costPrice: 7500.00,
  },
  {
    sku: "CP120Z-RIPPLE",
    name: "CUP PAPER RIPPLE 12OZ",
    description: "CUP PAPER RIPPLE 120Z 20*25 (NO BRAND)",
    category: "Cups & Containers",
    quantity: 4,
    reorderLevel: 20,
    unitPrice: 9730.00,
    costPrice: 7500.00,
  },
  {
    sku: "5-CLAM-FAKPAK",
    name: "5\" CLAMSHELL FAKPAK",
    description: "CLAMSHELL CONTAINER 5\" SQUARE HINGED (20X25) FAKPAK",
    category: "Containers",
    quantity: 0,
    reorderLevel: 30,
    unitPrice: 9738.70,
    costPrice: 7500.00,
  },
  {
    sku: "TRI-CLAM-FAKPAK-2",
    name: "TRI CLAMSHELL CONTAINER",
    description: "TRI SANDWICH CLAMSHELL CONTAINER (20X25) FAKPAK",
    category: "Containers",
    quantity: 20,
    reorderLevel: 30,
    unitPrice: 9854.64,
    costPrice: 7500.00,
  },
  {
    sku: "PP-LC-09",
    name: "PLATE PAPER 9\" PRO",
    description: "PLATE PAPER 9\" (1000CT) PRO BRAND",
    category: "Plates",
    quantity: 0,
    reorderLevel: 50,
    unitPrice: 9880.83,
    costPrice: 7500.00,
  },
  {
    sku: "GLN-LC-MED",
    name: "GLOVES NITRILE MEDIUM",
    description: "GLOVES POWDER FREE NITRILE BASTION 10*100",
    category: "Gloves & Safety",
    quantity: 6,
    reorderLevel: 15,
    unitPrice: 9941.54,
    costPrice: 7500.00,
  },
  {
    sku: "CUPS-16OZ-COMBO",
    name: "CUPS 16OZ W/LID COMBO",
    description: "COVEBAY 16 OZ PAPER SOUP CONTAINER + LIDS (10*25)",
    category: "Cups & Containers",
    quantity: 1,
    reorderLevel: 25,
    unitPrice: 10019.70,
    costPrice: 8000.00,
  },
  {
    sku: "CB-14-100",
    name: "CAKE BOX 14\" 100CT",
    description: "CAKE BOX 14.5''*11'' TOP & BOTTOM 100CT",
    category: "Cake Boxes",
    quantity: 0,
    reorderLevel: 20,
    unitPrice: 10036.58,
    costPrice: 8000.00,
  },
  {
    sku: "FSP-CB130-50",
    name: "FULL SIZE PAN 50CT",
    description: "FULL SIZE PAN 50CT COVE BAY",
    category: "Pans",
    quantity: 1,
    reorderLevel: 15,
    unitPrice: 10065.60,
    costPrice: 8000.00,
  },
  {
    sku: "CAN09-WHT",
    name: "CANDLES LOWBOY WHITE 30CT",
    description: "CANDLES LOWBOY WHITE 30CT QUALITY",
    category: "Candles",
    quantity: 2,
    reorderLevel: 10,
    unitPrice: 10118.00,
    costPrice: 8000.00,
  },
  {
    sku: "18OZ-BB-9X25",
    name: "18OZ BB CONTAINER 9X25",
    description: "18OZ MICROWAVABLE BLACKBASE CONTAINER (9X25) FAKPAK",
    category: "Containers",
    quantity: 16,
    reorderLevel: 30,
    unitPrice: 10123.50,
    costPrice: 8000.00,
  },
  {
    sku: "PBG-LC-01-4K",
    name: "PAPER BAG 1LB 4000CT",
    description: "PAPER BAG 1LB (4000CT)",
    category: "Paper Bags",
    quantity: 13,
    reorderLevel: 50,
    unitPrice: 10125.00,
    costPrice: 8000.00,
  },
  {
    sku: "AP2-DISP",
    name: "APRON DISPOSABLE 1000CT",
    description: "APRON DISPOSABLE QUALITY 10*100 37*33*17CM",
    category: "Safety & Apparel",
    quantity: 246,
    reorderLevel: 100,
    unitPrice: 10175.00,
    costPrice: 8000.00,
  },
  {
    sku: "GBB-003-240L",
    name: "GARBAGE BIN 240LT",
    description: "GARBAGE BIN PLASTIC STEP ON W/ WHEELS 240LT",
    category: "Cleaning Supplies",
    quantity: 81,
    reorderLevel: 20,
    unitPrice: 10178.40,
    costPrice: 8000.00,
  },
  {
    sku: "WP-1HP-220V-FED",
    name: "WATER PUMP 1HP 220V",
    description: "WATER PUMP 1HP 220VOLT (FEDERALLI)",
    category: "Equipment",
    quantity: 21,
    reorderLevel: 5,
    unitPrice: 10195.09,
    costPrice: 8000.00,
  },
  {
    sku: "CPS16OZ-LC",
    name: "CUP SMOOTHIE 16OZ",
    description: "CUP SMOOTHIE 16OZ COVEBAY 20*50(98MM)",
    category: "Cups & Containers",
    quantity: 4,
    reorderLevel: 25,
    unitPrice: 13041.00,
    costPrice: 10000.00,
  },
]

const leadsData = [
  {
    name: "John Smith",
    email: "john.smith@restaurant.com",
    phone: "+1-876-555-0101",
    company: "Smith's Restaurant",
    source: "Website",
    status: "new",
    notes: "Interested in bulk paper products for new restaurant opening",
  },
  {
    name: "Maria Garcia",
    email: "maria@cafeexpress.com",
    phone: "+1-876-555-0102",
    company: "Cafe Express",
    source: "Referral",
    status: "contacted",
    notes: "Looking for eco-friendly containers and cups",
  },
  {
    name: "David Chen",
    email: "david@foodtruckco.com",
    phone: "+1-876-555-0103",
    company: "Food Truck Co",
    source: "Trade Show",
    status: "qualified",
    notes: "Needs regular supply of to-go containers",
  },
  {
    name: "Sarah Johnson",
    email: "sarah@cateringpro.com",
    phone: "+1-876-555-0104",
    company: "Catering Pro",
    source: "Cold Call",
    status: "contacted",
    notes: "Event catering company, bulk orders expected",
  },
]

async function seed() {
  try {
    console.log("🌱 Starting database seed...")

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Find or create demo company
    let company = await Company.findOne({ licenseKey: "DEMO-LICENSE-KEY" })

    if (!company) {
      company = await Company.create({
        name: "Bizabode Demo Company",
        licenseKey: "DEMO-LICENSE-KEY",
        licensePlan: "professional",
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        licenseStatus: "active",
        settings: {
          currency: "JMD",
          taxRate: 15,
          timezone: "America/Jamaica",
        },
      })
      console.log("✅ Created demo company")
    } else {
      console.log("✅ Found existing company")
    }

    // Find or create demo user
    let user = await User.findOne({ email: "admin@example.com" })

    if (!user) {
      user = await User.create({
        email: "admin@example.com",
        password: "demo123",
        name: "Admin User",
        role: "admin",
        companyId: company._id,
        isActive: true,
      })
      console.log("✅ Created demo user (admin@example.com / demo123)")
    } else {
      console.log("✅ Found existing user")
    }

    // Clear existing items for this company
    await Item.deleteMany({ companyId: company._id })
    console.log("🗑️  Cleared existing items")

    // Create inventory items
    const items = await Item.insertMany(
      inventoryData.map((item) => ({
        ...item,
        companyId: company!._id,
        isActive: true,
      }))
    )
    console.log(`✅ Created ${items.length} inventory items`)

    // Clear existing leads
    await Lead.deleteMany({ companyId: company._id })

    // Create leads
    const leads = await Lead.insertMany(
      leadsData.map((lead) => ({
        ...lead,
        companyId: company!._id,
        assignedTo: user!._id,
      }))
    )
    console.log(`✅ Created ${leads.length} leads`)

    // Create 2 opportunities from leads
    const opportunities = await Opportunity.insertMany([
      {
        companyId: company._id,
        leadId: leads[2]._id,
        title: "Food Truck Supply Contract",
        customerName: leads[2].name,
        customerEmail: leads[2].email,
        customerPhone: leads[2].phone,
        value: 45000,
        stage: "proposal",
        probability: 75,
        expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        assignedTo: user._id,
        notes: "Monthly supply contract for food truck operations",
      },
      {
        companyId: company._id,
        leadId: leads[3]._id,
        title: "Catering Events Package",
        customerName: leads[3].name,
        customerEmail: leads[3].email,
        customerPhone: leads[3].phone,
        value: 28000,
        stage: "negotiation",
        probability: 90,
        expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        assignedTo: user._id,
        notes: "Large event coming up, needs containers and disposables",
      },
    ])
    console.log(`✅ Created ${opportunities.length} opportunities`)

    console.log("\n🎉 Database seeded successfully!")
    console.log("\n📊 Summary:")
    console.log(`   Company: ${company.name}`)
    console.log(`   User: ${user.email} (Password: demo123)`)
    console.log(`   Items: ${items.length}`)
    console.log(`   Leads: ${leads.length}`)
    console.log(`   Opportunities: ${opportunities.length}`)
    console.log("\n🔗 Login at: http://localhost:3000/login")
    console.log("   Email: admin@example.com")
    console.log("   Password: demo123")

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  }
}

seed()

