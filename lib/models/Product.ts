import mongoose, { Schema, Document } from "mongoose"

export interface IProduct extends Document {
  companyId: mongoose.Types.ObjectId
  name: string
  description: string
  sku: string
  category: string
  subcategory?: string
  brand?: string
  unit: string
  price: number
  cost: number
  margin: number
  images: string[]
  specifications?: {
    [key: string]: string | number
  }
  dimensions?: {
    length?: number
    width?: number
    height?: number
    weight?: number
  }
  stock: {
    quantity: number
    reserved: number
    available: number
    reorderLevel: number
    reorderQuantity: number
  }
  pricing: {
    basePrice: number
    volumeDiscounts?: {
      minQuantity: number
      discountPercentage: number
    }[]
    customerSpecificPricing?: {
      customerId: mongoose.Types.ObjectId
      price: number
    }[]
    promotionalPricing?: {
      startDate: Date
      endDate: Date
      price: number
      reason: string
    }[]
  }
  status: "Active" | "Inactive" | "Discontinued"
  tags: string[]
  isDigital: boolean
  requiresShipping: boolean
  taxCategory: string
  supplier?: {
    name: string
    contact: string
    email: string
    phone: string
  }
  createdAt: Date
  updatedAt: Date
}

const ProductSchema = new Schema<IProduct>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      index: true,
    },
    brand: {
      type: String,
      index: true,
    },
    unit: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    margin: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [String],
    specifications: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
    },
    stock: {
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
      reserved: {
        type: Number,
        default: 0,
        min: 0,
      },
      available: {
        type: Number,
        default: 0,
        min: 0,
      },
      reorderLevel: {
        type: Number,
        default: 0,
        min: 0,
      },
      reorderQuantity: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
        min: 0,
      },
      volumeDiscounts: [{
        minQuantity: {
          type: Number,
          required: true,
          min: 1,
        },
        discountPercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      }],
      customerSpecificPricing: [{
        customerId: {
          type: Schema.Types.ObjectId,
          ref: "Customer",
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      }],
      promotionalPricing: [{
        startDate: {
          type: Date,
          required: true,
        },
        endDate: {
          type: Date,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        reason: String,
      }],
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Discontinued"],
      default: "Active",
      index: true,
    },
    tags: [String],
    isDigital: {
      type: Boolean,
      default: false,
    },
    requiresShipping: {
      type: Boolean,
      default: true,
    },
    taxCategory: {
      type: String,
      required: true,
    },
    supplier: {
      name: String,
      contact: String,
      email: String,
      phone: String,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
ProductSchema.index({ companyId: 1, category: 1 })
ProductSchema.index({ companyId: 1, status: 1 })
ProductSchema.index({ companyId: 1, sku: 1 })
ProductSchema.index({ companyId: 1, brand: 1 })
ProductSchema.index({ companyId: 1, tags: 1 })
ProductSchema.index({ companyId: 1, "stock.available": 1 })

// Pre-save middleware to calculate available stock and margin
ProductSchema.pre('save', function(next) {
  this.stock.available = this.stock.quantity - this.stock.reserved
  this.margin = this.price - this.cost
  next()
})

export default mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
