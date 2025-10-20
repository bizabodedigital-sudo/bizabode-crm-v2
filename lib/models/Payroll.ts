import mongoose, { Schema, Document } from "mongoose"

export interface IPayroll extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  payPeriod: {
    startDate: Date
    endDate: Date
  }
  items: Array<{
    type: string
    description: string
    amount: number
  }>
  grossPay: number
  deductions: number
  netPay: number
  paymentDate: Date
  createdAt: Date
  updatedAt: Date
}

const PayrollSchema = new Schema<IPayroll>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    payPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    items: [
      {
        type: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],
    grossPay: {
      type: Number,
      required: true,
    },
    deductions: {
      type: Number,
      required: true,
    },
    netPay: {
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Payroll || mongoose.model<IPayroll>("Payroll", PayrollSchema)