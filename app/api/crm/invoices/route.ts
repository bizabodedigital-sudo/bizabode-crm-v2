import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { z } from 'zod';
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
  dueDate: {
    type: Date,
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

// Validation schema
const invoiceSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid customer email is required'),
  dueDate: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().optional(),
    name: z.string().min(1, 'Item name is required'),
    description: z.string().optional(),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  })).min(1, 'At least one item is required'),
  tax: z.number().min(0, 'Tax must be non-negative').optional(),
  notes: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  createdBy: z.string().min(1, 'Created by is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = invoiceSchema.parse(body);
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`;
    
    // Calculate totals
    const items = validatedData.items.map(item => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = validatedData.tax || 0;
    const total = subtotal + tax;
    
    // Create new invoice
    const invoice = new Invoice({
      ...validatedData,
      number: invoiceNumber,
      items,
      subtotal,
      tax,
      total,
      paidTotal: 0,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    });
    
    await invoice.save();
    
    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create invoice:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('companyId') || '';
    
    // Build query
    const query: any = {};
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { number: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get invoices with pagination
    const skip = (page - 1) * limit;
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Invoice.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
