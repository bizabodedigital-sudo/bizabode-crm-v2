import mongoose, { Schema, Document } from "mongoose"

export interface IItem extends Document {
  companyId: mongoose.Types.ObjectId
  sku: string
  name: string
  description: string
  category: string
  quantity: number
  reorderLevel: number
  unitPrice: number
  costPrice: number
  imageUrl?: string
  barcode?: string
  location?: string
  supplier?: string
  isActive: boolean
  critical: boolean
  createdAt: Date
  updatedAt: Date
}

const ItemSchema = new Schema<IItem>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    sku: {
      type: String,
      required: [true, "SKU is required"],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reorderLevel: {
      type: Number,
      default: 10,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
    barcode: {
      type: String,
    },
    location: {
      type: String,
    },
    supplier: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    critical: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for unique SKU per company
ItemSchema.index({ companyId: 1, sku: 1 }, { unique: true })

const Item = mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema)

export { Item }
export default Item

