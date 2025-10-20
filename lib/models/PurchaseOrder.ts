import mongoose, { Schema, Document } from "mongoose"

export interface IPurchaseOrderItem {
  itemId: mongoose.Types.ObjectId
  sku: string
  name: string
  quantity: number
  unitCost: number
  totalCost: number
}

export interface IPurchaseOrder extends Document {
  companyId: mongoose.Types.ObjectId
  poNumber: string
  supplierId: mongoose.Types.ObjectId
  supplierName: string
  items: IPurchaseOrderItem[]
  status: 'draft' | 'sent' | 'received' | 'cancelled'
  total: number
  notes?: string
  createdBy: mongoose.Types.ObjectId
  sentDate?: Date
  receivedDate?: Date
  createdAt: Date
  updatedAt: Date
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0,
  },
})

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    poNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    supplierName: {
      type: String,
      required: true,
    },
    items: [PurchaseOrderItemSchema],
    status: {
      type: String,
      enum: ['draft', 'sent', 'received', 'cancelled'],
      default: 'draft',
      index: true,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentDate: {
      type: Date,
    },
    receivedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for unique PO number per company
PurchaseOrderSchema.index({ companyId: 1, poNumber: 1 }, { unique: true })

// Index for status queries
PurchaseOrderSchema.index({ companyId: 1, status: 1 })

// Index for supplier queries
PurchaseOrderSchema.index({ companyId: 1, supplierId: 1 })

const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model<IPurchaseOrder>("PurchaseOrder", PurchaseOrderSchema)

export { PurchaseOrder }
export default PurchaseOrder
