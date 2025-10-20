import mongoose, { Schema, Document } from "mongoose"

export interface IStockMovement extends Document {
  companyId: mongoose.Types.ObjectId
  itemId: mongoose.Types.ObjectId
  type: "in" | "out" | "adjustment" | "return"
  quantity: number
  previousQuantity: number
  newQuantity: number
  reason: string
  reference?: string
  userId: mongoose.Types.ObjectId
  createdAt: Date
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["in", "out", "adjustment", "return"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const StockMovement = mongoose.models.StockMovement || mongoose.model<IStockMovement>("StockMovement", StockMovementSchema)

export { StockMovement }
export default StockMovement

