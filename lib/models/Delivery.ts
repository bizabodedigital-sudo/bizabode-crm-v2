import mongoose, { Schema, Document } from "mongoose"

export interface IDelivery extends Document {
  companyId: mongoose.Types.ObjectId
  invoiceId: mongoose.Types.ObjectId
  deliveryNumber: string
  customerName: string
  address: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  scheduledDate: Date
  status: "scheduled" | "in-transit" | "delivered" | "failed" | "cancelled"
  driverName?: string
  driverPhone?: string
  vehicleNumber?: string
  qrCode: string
  qrCodeUrl?: string
  confirmedAt?: Date
  confirmedBy?: string
  signatureUrl?: string
  photoUrl?: string
  notes: string
  failureReason?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const DeliverySchema = new Schema<IDelivery>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    deliveryNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: String,
    state: String,
    zipCode: String,
    country: String,
    scheduledDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "in-transit", "delivered", "failed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    driverName: String,
    driverPhone: String,
    vehicleNumber: String,
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    qrCodeUrl: String,
    confirmedAt: Date,
    confirmedBy: String,
    signatureUrl: String,
    photoUrl: String,
    notes: {
      type: String,
      default: "",
    },
    failureReason: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Delivery || mongoose.model<IDelivery>("Delivery", DeliverySchema)

