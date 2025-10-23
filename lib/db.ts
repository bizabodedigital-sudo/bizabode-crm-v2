import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bizabode-crm"

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env")
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache
}

let cached: MongooseCache = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully")
      
      // Create database indexes for performance
      createIndexes()
      
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Create database indexes for better performance
async function createIndexes() {
  try {
    const db = mongoose.connection.db
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true, background: true })
    await db.collection('users').createIndex({ companyId: 1 }, { background: true })
    await db.collection('users').createIndex({ role: 1 }, { background: true })
    
    // Lead indexes
    await db.collection('leads').createIndex({ companyId: 1 }, { background: true })
    await db.collection('leads').createIndex({ status: 1 }, { background: true })
    await db.collection('leads').createIndex({ assignedTo: 1 }, { background: true })
    await db.collection('leads').createIndex({ createdAt: -1 }, { background: true })
    
    // Opportunity indexes
    await db.collection('opportunities').createIndex({ companyId: 1 }, { background: true })
    await db.collection('opportunities').createIndex({ status: 1 }, { background: true })
    await db.collection('opportunities').createIndex({ assignedTo: 1 }, { background: true })
    await db.collection('opportunities').createIndex({ createdAt: -1 }, { background: true })
    
    // Item indexes - Check if index exists before creating
    try {
      await db.collection('items').createIndex({ companyId: 1 }, { background: true })
      await db.collection('items').createIndex({ category: 1 }, { background: true })
      await db.collection('items').createIndex({ isActive: 1 }, { background: true })
      
      // Handle SKU index carefully to avoid conflicts
      const existingIndexes = await db.collection('items').listIndexes().toArray()
      const skuIndexExists = existingIndexes.some(index => 
        index.key && index.key.sku === 1
      )
      
      if (!skuIndexExists) {
        await db.collection('items').createIndex({ sku: 1 }, { unique: true, background: true })
      }
    } catch (indexError) {
      console.log("⚠️ Some item indexes already exist, skipping...")
    }
    
    // Invoice indexes
    await db.collection('invoices').createIndex({ companyId: 1 }, { background: true })
    await db.collection('invoices').createIndex({ status: 1 }, { background: true })
    await db.collection('invoices').createIndex({ createdAt: -1 }, { background: true })
    
    // Employee indexes
    await db.collection('employees').createIndex({ companyId: 1 }, { background: true })
    await db.collection('employees').createIndex({ department: 1 }, { background: true })
    
    // Handle employee ID index carefully
    try {
      await db.collection('employees').createIndex({ employeeId: 1 }, { unique: true, background: true })
    } catch (employeeIndexError) {
      console.log("⚠️ Employee ID index already exists, skipping...")
    }
    
    console.log("✅ Database indexes created successfully")
  } catch (error) {
    console.error("❌ Error creating database indexes:", error)
  }
}

export { connectDB }
export { connectDB as connect }
export default connectDB

