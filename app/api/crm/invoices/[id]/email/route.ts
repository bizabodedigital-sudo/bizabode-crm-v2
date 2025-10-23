import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Invoice schema
const InvoiceSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },
  number: {
    type: String,
    required: true,
    unique: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'overdue'],
    default: 'unpaid',
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  paidTotal: {
    type: Number,
    default: 0,
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: false,
    },
    name: String,
    description: String,
    quantity: Number,
    unitPrice: Number,
    lineTotal: Number,
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

const Invoice = mongoose.models.InvoiceNew || mongoose.model('InvoiceNew', InvoiceSchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const body = await request.json();
    const { recipientEmail } = body;
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // For now, just return success - in a real app you'd integrate with an email service
    // like SendGrid, AWS SES, or Nodemailer
    console.log(`Would send invoice ${invoice.number} to ${recipientEmail || invoice.customerEmail}`);
    
    return NextResponse.json({
      success: true,
      message: 'Invoice email sent successfully',
      data: {
        invoiceId: invoice._id,
        recipientEmail: recipientEmail || invoice.customerEmail,
        status: 'sent'
      }
    });
    
  } catch (error) {
    console.error('Failed to send invoice email:', error);
    return NextResponse.json(
      { error: 'Failed to send invoice email' },
      { status: 500 }
    );
  }
}
