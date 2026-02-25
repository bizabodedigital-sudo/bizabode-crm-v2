import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import Item from "../lib/models/Item"
import Company from "../lib/models/Company"

dotenv.config({ path: path.join(__dirname, "../.env.local") })

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://root:examplepassword@localhost:27017/bizabode-crm?authSource=admin"

// Comprehensive MIC (Master Item Code) data
const micData = [
  // Electronics & Technology
  { itemCode: "MIC-ELC-001", name: "Laptop Computer - Dell Inspiron 15", category: "Electronics", subcategory: "Computers", unit: "pcs", unitPrice: 899.99, stockQuantity: 25, minStockLevel: 5, description: "15.6-inch laptop with Intel i5 processor, 8GB RAM, 256GB SSD", specifications: "Intel Core i5-1135G7, 8GB DDR4, 256GB SSD, Windows 11", supplier: "Dell Technologies", brand: "Dell", weight: 1.8, dimensions: "14.1 x 9.3 x 0.7 inches" },
  { itemCode: "MIC-ELC-002", name: "Wireless Mouse - Logitech MX Master 3", category: "Electronics", subcategory: "Accessories", unit: "pcs", unitPrice: 99.99, stockQuantity: 50, minStockLevel: 10, description: "Premium wireless mouse with precision tracking", specifications: "4000 DPI, Bluetooth connectivity, 70-day battery life", supplier: "Logitech", brand: "Logitech", weight: 0.14, dimensions: "4.9 x 3.2 x 2.0 inches" },
  { itemCode: "MIC-ELC-003", name: "Mechanical Keyboard - Corsair K95 RGB", category: "Electronics", subcategory: "Accessories", unit: "pcs", unitPrice: 199.99, stockQuantity: 30, minStockLevel: 8, description: "High-performance mechanical gaming keyboard", specifications: "Cherry MX Speed switches, RGB backlighting, 6 macro keys", supplier: "Corsair", brand: "Corsair", weight: 1.2, dimensions: "18.1 x 6.5 x 1.2 inches" },
  { itemCode: "MIC-ELC-004", name: "4K Monitor - Samsung 32-inch", category: "Electronics", subcategory: "Displays", unit: "pcs", unitPrice: 399.99, stockQuantity: 15, minStockLevel: 3, description: "32-inch 4K UHD monitor with HDR support", specifications: "3840x2160 resolution, 60Hz refresh rate, HDMI/DisplayPort", supplier: "Samsung Electronics", brand: "Samsung", weight: 7.3, dimensions: "28.7 x 20.9 x 2.4 inches" },
  { itemCode: "MIC-ELC-005", name: "USB-C Hub - Anker 7-in-1", category: "Electronics", subcategory: "Accessories", unit: "pcs", unitPrice: 49.99, stockQuantity: 40, minStockLevel: 12, description: "7-in-1 USB-C hub with multiple ports", specifications: "USB-C, USB-A, HDMI, SD card reader, Ethernet", supplier: "Anker", brand: "Anker", weight: 0.2, dimensions: "4.3 x 1.4 x 0.6 inches" },

  // Office Supplies
  { itemCode: "MIC-OFF-001", name: "A4 Copy Paper - 500 sheets", category: "Office Supplies", subcategory: "Paper", unit: "ream", unitPrice: 8.99, stockQuantity: 100, minStockLevel: 25, description: "High-quality white copy paper, 80gsm", specifications: "A4 size, 80gsm weight, 500 sheets per ream", supplier: "PaperCo", brand: "OfficeMax", weight: 2.5, dimensions: "8.3 x 11.7 x 2.0 inches" },
  { itemCode: "MIC-OFF-002", name: "Ballpoint Pen - Blue Ink", category: "Office Supplies", subcategory: "Writing", unit: "pcs", unitPrice: 1.99, stockQuantity: 200, minStockLevel: 50, description: "Smooth-writing ballpoint pen with blue ink", specifications: "0.7mm tip, blue ink, retractable", supplier: "PenCorp", brand: "Bic", weight: 0.01, dimensions: "5.5 x 0.4 x 0.4 inches" },
  { itemCode: "MIC-OFF-003", name: "Stapler - Heavy Duty", category: "Office Supplies", subcategory: "Stationery", unit: "pcs", unitPrice: 24.99, stockQuantity: 20, minStockLevel: 5, description: "Heavy-duty stapler for up to 20 sheets", specifications: "20-sheet capacity, metal construction, black finish", supplier: "OfficePro", brand: "Swingline", weight: 0.8, dimensions: "7.5 x 2.0 x 1.5 inches" },
  { itemCode: "MIC-OFF-004", name: "File Folder - Manila", category: "Office Supplies", subcategory: "Filing", unit: "pcs", unitPrice: 0.49, stockQuantity: 500, minStockLevel: 100, description: "Standard manila file folder with tab", specifications: "Letter size, manila color, 1/3 cut tab", supplier: "FileCorp", brand: "Avery", weight: 0.02, dimensions: "9.5 x 11.8 x 0.1 inches" },
  { itemCode: "MIC-OFF-005", name: "Whiteboard - 4x3 feet", category: "Office Supplies", subcategory: "Presentation", unit: "pcs", unitPrice: 89.99, stockQuantity: 10, minStockLevel: 2, description: "Magnetic whiteboard with aluminum frame", specifications: "4x3 feet, magnetic surface, aluminum frame", supplier: "BoardCo", brand: "Quartet", weight: 8.5, dimensions: "48 x 36 x 1.5 inches" },

  // Furniture
  { itemCode: "MIC-FUR-001", name: "Office Chair - Ergonomic", category: "Furniture", subcategory: "Seating", unit: "pcs", unitPrice: 299.99, stockQuantity: 15, minStockLevel: 3, description: "Ergonomic office chair with lumbar support", specifications: "Adjustable height, lumbar support, mesh back, 5-year warranty", supplier: "FurniturePlus", brand: "Herman Miller", weight: 25.0, dimensions: "26 x 26 x 42 inches" },
  { itemCode: "MIC-FUR-002", name: "Desk - Executive Wood", category: "Furniture", subcategory: "Desks", unit: "pcs", unitPrice: 599.99, stockQuantity: 8, minStockLevel: 2, description: "Executive wooden desk with drawers", specifications: "Solid oak construction, 3 drawers, 60x30 inches", supplier: "WoodDesk Co", brand: "IKEA", weight: 45.0, dimensions: "60 x 30 x 30 inches" },
  { itemCode: "MIC-FUR-003", name: "Bookshelf - 5-tier", category: "Furniture", subcategory: "Storage", unit: "pcs", unitPrice: 149.99, stockQuantity: 12, minStockLevel: 3, description: "5-tier wooden bookshelf", specifications: "Pine wood, 5 shelves, 72 inches tall", supplier: "ShelfCorp", brand: "IKEA", weight: 35.0, dimensions: "31 x 12 x 72 inches" },
  { itemCode: "MIC-FUR-004", name: "Filing Cabinet - 2-drawer", category: "Furniture", subcategory: "Storage", unit: "pcs", unitPrice: 199.99, stockQuantity: 10, minStockLevel: 2, description: "Metal filing cabinet with 2 drawers", specifications: "Steel construction, 2 drawers, lockable, 15-inch width", supplier: "FileCab Corp", brand: "Hon", weight: 28.0, dimensions: "15 x 28 x 18 inches" },
  { itemCode: "MIC-FUR-005", name: "Conference Table - 8-person", category: "Furniture", subcategory: "Tables", unit: "pcs", unitPrice: 899.99, stockQuantity: 5, minStockLevel: 1, description: "Large conference table for 8 people", specifications: "Oak veneer, 96x48 inches, seats 8", supplier: "TablePro", brand: "Steelcase", weight: 120.0, dimensions: "96 x 48 x 30 inches" },

  // Industrial Equipment
  { itemCode: "MIC-IND-001", name: "Air Compressor - 20 Gallon", category: "Industrial", subcategory: "Tools", unit: "pcs", unitPrice: 299.99, stockQuantity: 8, minStockLevel: 2, description: "20-gallon air compressor for industrial use", specifications: "20-gallon tank, 2.5 HP motor, 150 PSI max pressure", supplier: "ToolCorp", brand: "DeWalt", weight: 85.0, dimensions: "24 x 18 x 20 inches" },
  { itemCode: "MIC-IND-002", name: "Safety Helmet - Hard Hat", category: "Industrial", subcategory: "Safety", unit: "pcs", unitPrice: 24.99, stockQuantity: 50, minStockLevel: 15, description: "ANSI-approved safety hard hat", specifications: "Type I, Class C, white color, adjustable suspension", supplier: "SafetyGear", brand: "3M", weight: 0.5, dimensions: "11 x 9 x 6 inches" },
  { itemCode: "MIC-IND-003", name: "Steel Cable - 1/4 inch", category: "Industrial", subcategory: "Materials", unit: "ft", unitPrice: 2.99, stockQuantity: 1000, minStockLevel: 200, description: "Galvanized steel cable, 1/4 inch diameter", specifications: "7x19 construction, galvanized finish, 1/4 inch diameter", supplier: "CableCorp", brand: "Generic", weight: 0.1, dimensions: "1/4 inch diameter" },
  { itemCode: "MIC-IND-004", name: "Welding Machine - MIG 140", category: "Industrial", subcategory: "Tools", unit: "pcs", unitPrice: 399.99, stockQuantity: 6, minStockLevel: 2, description: "MIG welding machine, 140 amp output", specifications: "140 amp output, 120V input, gasless flux core", supplier: "WeldCorp", brand: "Lincoln Electric", weight: 35.0, dimensions: "16 x 8 x 12 inches" },
  { itemCode: "MIC-IND-005", name: "Safety Glasses - Clear", category: "Industrial", subcategory: "Safety", unit: "pcs", unitPrice: 8.99, stockQuantity: 100, minStockLevel: 25, description: "ANSI Z87.1 approved safety glasses", specifications: "Clear lenses, side protection, UV filtering", supplier: "EyePro", brand: "3M", weight: 0.05, dimensions: "6 x 2 x 1 inches" },

  // Automotive Parts
  { itemCode: "MIC-AUTO-001", name: "Engine Oil - 5W-30", category: "Automotive", subcategory: "Fluids", unit: "qt", unitPrice: 12.99, stockQuantity: 200, minStockLevel: 50, description: "Synthetic engine oil, 5W-30 viscosity", specifications: "5W-30 viscosity, synthetic blend, 1 quart", supplier: "OilCorp", brand: "Mobil 1", weight: 1.8, dimensions: "4 x 3 x 8 inches" },
  { itemCode: "MIC-AUTO-002", name: "Brake Pads - Front Set", category: "Automotive", subcategory: "Brakes", unit: "set", unitPrice: 89.99, stockQuantity: 25, minStockLevel: 8, description: "Ceramic brake pads for front wheels", specifications: "Ceramic compound, low dust, high performance", supplier: "BrakeCorp", brand: "Brembo", weight: 2.5, dimensions: "6 x 4 x 1 inches" },
  { itemCode: "MIC-AUTO-003", name: "Air Filter - Engine", category: "Automotive", subcategory: "Filters", unit: "pcs", unitPrice: 24.99, stockQuantity: 40, minStockLevel: 10, description: "High-flow air filter for engine", specifications: "Cotton gauze filter, washable, high flow", supplier: "FilterCorp", brand: "K&N", weight: 0.8, dimensions: "8 x 6 x 2 inches" },
  { itemCode: "MIC-AUTO-004", name: "Spark Plugs - Set of 4", category: "Automotive", subcategory: "Ignition", unit: "set", unitPrice: 39.99, stockQuantity: 30, minStockLevel: 8, description: "Iridium spark plugs, set of 4", specifications: "Iridium tip, 0.044 inch gap, long life", supplier: "SparkCorp", brand: "NGK", weight: 0.2, dimensions: "3 x 0.6 x 0.6 inches" },
  { itemCode: "MIC-AUTO-005", name: "Tire - 225/60R16", category: "Automotive", subcategory: "Tires", unit: "pcs", unitPrice: 149.99, stockQuantity: 20, minStockLevel: 5, description: "All-season radial tire", specifications: "225/60R16, all-season, 60,000 mile warranty", supplier: "TireCorp", brand: "Michelin", weight: 22.0, dimensions: "25 x 8 x 8 inches" },

  // Medical Supplies
  { itemCode: "MIC-MED-001", name: "Surgical Gloves - Latex", category: "Medical", subcategory: "Protection", unit: "box", unitPrice: 24.99, stockQuantity: 50, minStockLevel: 15, description: "Powder-free latex surgical gloves", specifications: "Powder-free, latex, size M, 100 gloves per box", supplier: "MedCorp", brand: "Ansell", weight: 0.5, dimensions: "8 x 6 x 2 inches" },
  { itemCode: "MIC-MED-002", name: "Bandage - Adhesive", category: "Medical", subcategory: "Wound Care", unit: "box", unitPrice: 8.99, stockQuantity: 100, minStockLevel: 25, description: "Waterproof adhesive bandages", specifications: "Waterproof, various sizes, 100 per box", supplier: "BandageCorp", brand: "Band-Aid", weight: 0.2, dimensions: "6 x 4 x 1 inches" },
  { itemCode: "MIC-MED-003", name: "Thermometer - Digital", category: "Medical", subcategory: "Diagnostic", unit: "pcs", unitPrice: 19.99, stockQuantity: 30, minStockLevel: 8, description: "Digital oral/rectal thermometer", specifications: "Digital display, 10-second reading, waterproof", supplier: "MedTech", brand: "Omron", weight: 0.1, dimensions: "6 x 1 x 1 inches" },
  { itemCode: "MIC-MED-004", name: "Blood Pressure Cuff", category: "Medical", subcategory: "Diagnostic", unit: "pcs", unitPrice: 49.99, stockQuantity: 15, minStockLevel: 4, description: "Manual blood pressure cuff", specifications: "Adult size, latex-free, 12-16 inch arm", supplier: "MedEquip", brand: "Welch Allyn", weight: 0.8, dimensions: "12 x 4 x 2 inches" },
  { itemCode: "MIC-MED-005", name: "Stethoscope - Professional", category: "Medical", subcategory: "Diagnostic", unit: "pcs", unitPrice: 89.99, stockQuantity: 20, minStockLevel: 5, description: "Professional grade stethoscope", specifications: "Dual-head design, tunable diaphragms, 5-year warranty", supplier: "MedPro", brand: "Littmann", weight: 0.3, dimensions: "30 x 2 x 1 inches" },

  // Food & Beverage
  { itemCode: "MIC-FOOD-001", name: "Coffee Beans - Arabica", category: "Food & Beverage", subcategory: "Coffee", unit: "lb", unitPrice: 12.99, stockQuantity: 50, minStockLevel: 15, description: "Premium Arabica coffee beans, medium roast", specifications: "100% Arabica, medium roast, 1 lb bag", supplier: "CoffeeCorp", brand: "Starbucks", weight: 1.0, dimensions: "8 x 6 x 2 inches" },
  { itemCode: "MIC-FOOD-002", name: "Bottled Water - 500ml", category: "Food & Beverage", subcategory: "Beverages", unit: "case", unitPrice: 24.99, stockQuantity: 100, minStockLevel: 25, description: "Purified bottled water, 500ml bottles", specifications: "24 bottles per case, purified water, BPA-free", supplier: "WaterCorp", brand: "Aquafina", weight: 12.0, dimensions: "12 x 8 x 6 inches" },
  { itemCode: "MIC-FOOD-003", name: "Energy Bar - Protein", category: "Food & Beverage", subcategory: "Snacks", unit: "box", unitPrice: 19.99, stockQuantity: 40, minStockLevel: 10, description: "High-protein energy bars", specifications: "20g protein, 12 bars per box, chocolate flavor", supplier: "SnackCorp", brand: "Quest", weight: 1.2, dimensions: "8 x 6 x 3 inches" },
  { itemCode: "MIC-FOOD-004", name: "Tea Bags - Green Tea", category: "Food & Beverage", subcategory: "Tea", unit: "box", unitPrice: 14.99, stockQuantity: 60, minStockLevel: 15, description: "Premium green tea bags", specifications: "100 tea bags, organic, individually wrapped", supplier: "TeaCorp", brand: "Twinings", weight: 0.5, dimensions: "6 x 4 x 2 inches" },
  { itemCode: "MIC-FOOD-005", name: "Granola Bars - Mixed", category: "Food & Beverage", subcategory: "Snacks", unit: "box", unitPrice: 16.99, stockQuantity: 35, minStockLevel: 10, description: "Mixed variety granola bars", specifications: "12 bars per box, 3 flavors, organic", supplier: "GranolaCorp", brand: "Nature Valley", weight: 0.8, dimensions: "8 x 6 x 2 inches" },

  // Cleaning Supplies
  { itemCode: "MIC-CLEAN-001", name: "All-Purpose Cleaner", category: "Cleaning", subcategory: "Chemicals", unit: "bottle", unitPrice: 6.99, stockQuantity: 80, minStockLevel: 20, description: "Multi-surface all-purpose cleaner", specifications: "32 oz bottle, biodegradable, lemon scent", supplier: "CleanCorp", brand: "Lysol", weight: 2.0, dimensions: "4 x 3 x 10 inches" },
  { itemCode: "MIC-CLEAN-002", name: "Paper Towels - 2-ply", category: "Cleaning", subcategory: "Paper", unit: "roll", unitPrice: 2.99, stockQuantity: 200, minStockLevel: 50, description: "2-ply paper towels, 12 rolls", specifications: "2-ply, 12 rolls per pack, absorbent", supplier: "PaperCorp", brand: "Bounty", weight: 1.5, dimensions: "6 x 4 x 8 inches" },
  { itemCode: "MIC-CLEAN-003", name: "Disinfectant Wipes", category: "Cleaning", subcategory: "Wipes", unit: "container", unitPrice: 8.99, stockQuantity: 60, minStockLevel: 15, description: "Disinfecting surface wipes", specifications: "75 wipes per container, kills 99.9% of germs", supplier: "WipeCorp", brand: "Clorox", weight: 1.0, dimensions: "5 x 3 x 6 inches" },
  { itemCode: "MIC-CLEAN-004", name: "Trash Bags - 13 gallon", category: "Cleaning", subcategory: "Bags", unit: "box", unitPrice: 12.99, stockQuantity: 40, minStockLevel: 10, description: "Heavy-duty trash bags, 13 gallon", specifications: "50 bags per box, 13 gallon capacity, drawstring", supplier: "BagCorp", brand: "Glad", weight: 2.5, dimensions: "8 x 6 x 4 inches" },
  { itemCode: "MIC-CLEAN-005", name: "Floor Cleaner - Concentrate", category: "Cleaning", subcategory: "Chemicals", unit: "bottle", unitPrice: 15.99, stockQuantity: 25, minStockLevel: 6, description: "Concentrated floor cleaner", specifications: "64 oz concentrate, makes 32 gallons, pine scent", supplier: "FloorCorp", brand: "Mr. Clean", weight: 4.0, dimensions: "6 x 4 x 12 inches" }
]

async function seedMICData() {
  try {
    console.log("🌱 Starting comprehensive MIC data seed...")
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    const company = await Company.findOne({ licenseKey: "demo-company-license" })
    if (!company) {
      console.error("❌ Demo company not found. Please run main seed script first.")
      process.exit(1)
    }

    // Clear existing items
    await Item.deleteMany({ companyId: company._id })
    console.log("🗑️  Cleared existing items")

    // Create items with comprehensive MIC data
    const createdItems = await Item.insertMany(
      micData.map(item => ({
        companyId: company._id,
        sku: item.itemCode, // Use itemCode as SKU
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.stockQuantity,
        reorderLevel: item.minStockLevel,
        unitPrice: item.unitPrice,
        costPrice: item.unitPrice * 0.7, // Assume 30% markup
        supplier: item.supplier,
        isActive: true,
        critical: item.stockQuantity <= item.minStockLevel
      }))
    )

    console.log(`✅ Created ${createdItems.length} items with comprehensive MIC data`)

    // Calculate statistics
    const categories = [...new Set(createdItems.map(item => item.category))]
    const subcategories = [...new Set(createdItems.map(item => item.subcategory))]
    const totalValue = createdItems.reduce((sum, item) => sum + (item.unitPrice * item.stockQuantity), 0)
    const lowStockItems = createdItems.filter(item => item.stockQuantity <= item.minStockLevel).length

    console.log("\n🎉 Comprehensive MIC data seeded successfully!")
    console.log("\n📊 Summary:")
    console.log(`   Total Items: ${createdItems.length}`)
    console.log(`   Categories: ${categories.length}`)
    console.log(`   Subcategories: ${subcategories.length}`)
    console.log(`   Total Inventory Value: $${totalValue.toLocaleString()}`)
    console.log(`   Low Stock Items: ${lowStockItems}`)
    console.log("\n📋 Categories:")
    categories.forEach(cat => {
      const count = createdItems.filter(item => item.category === cat).length
      console.log(`   • ${cat}: ${count} items`)
    })
    console.log("\n🔗 Visit Inventory: http://localhost:3000/inventory")

    await mongoose.disconnect()
    process.exit(0)
  } catch (error) {
    console.error("❌ MIC Seed failed:", error)
    process.exit(1)
  }
}

seedMICData()
