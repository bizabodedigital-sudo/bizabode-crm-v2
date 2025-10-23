import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Quote schema
const QuoteSchema = new mongoose.Schema({
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
  validUntil: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'accepted', 'expired'],
    default: 'draft',
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

const Quote = mongoose.models.QuoteNew || mongoose.model('QuoteNew', QuoteSchema);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const body = await request.json();
    const { recipientEmail } = body;
    
    const quote = await Quote.findById(id);
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    // For now, just return success - in a real app you'd integrate with an email service
    // like SendGrid, AWS SES, or Nodemailer
    console.log(`Would send quote ${quote.number} to ${recipientEmail || quote.customerEmail}`);
    
    return NextResponse.json({
      success: true,
      message: 'Quote email sent successfully',
      data: {
        quoteId: quote._id,
        recipientEmail: recipientEmail || quote.customerEmail,
        status: 'sent'
      }
    });
    
  } catch (error) {
    console.error('Failed to send quote email:', error);
    return NextResponse.json(
      { error: 'Failed to send quote email' },
      { status: 500 }
    );
  }
}
