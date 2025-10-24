import mongoose from 'mongoose'

interface MongoDBConfig {
  uri: string
  options?: mongoose.ConnectOptions
}

class MongoDBConnection {
  private config: MongoDBConfig
  private isConnected: boolean = false

  constructor(config: MongoDBConfig) {
    this.config = config
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      return
    }

    try {
      const options: mongoose.ConnectOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        bufferMaxEntries: 0,
        ...this.config.options
      }

      await mongoose.connect(this.config.uri, options)
      this.isConnected = true
      
      console.log('✅ MongoDB connected successfully')
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return
    }

    try {
      await mongoose.disconnect()
      this.isConnected = false
      console.log('✅ MongoDB disconnected successfully')
    } catch (error) {
      console.error('❌ MongoDB disconnection failed:', error)
      throw error
    }
  }

  isConnectionActive(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1
  }

  getConnectionState(): number {
    return mongoose.connection.readyState
  }

  async ping(): Promise<boolean> {
    try {
      await mongoose.connection.db?.admin().ping()
      return true
    } catch (error) {
      console.error('MongoDB ping failed:', error)
      return false
    }
  }

  getConnection(): mongoose.Connection {
    return mongoose.connection
  }
}

// Create default instance
const mongoDB = new MongoDBConnection({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bizabode_crm',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    bufferMaxEntries: 0
  }
})

// Export connection functions for backward compatibility
export const connectDB = async (): Promise<void> => {
  await mongoDB.connect()
}

export const disconnectDB = async (): Promise<void> => {
  await mongoDB.disconnect()
}

export const isConnected = (): boolean => {
  return mongoDB.isConnectionActive()
}

export const pingDB = async (): Promise<boolean> => {
  return await mongoDB.ping()
}

export const getConnection = (): mongoose.Connection => {
  return mongoDB.getConnection()
}

export default mongoDB
export { MongoDBConnection }
export type { MongoDBConfig }
