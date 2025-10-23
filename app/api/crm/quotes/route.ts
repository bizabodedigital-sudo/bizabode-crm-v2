import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { z } from 'zod';
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
      required: false, // Make itemId optional
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

// Validation schema
const quoteSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z.string().email('Valid customer email is required'),
  validUntil: z.string().optional(),
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
    const validatedData = quoteSchema.parse(body);
    
    // Generate quote number
    const quoteNumber = `Q-${Date.now()}`;
    
    // Calculate totals
    const items = validatedData.items.map(item => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    }));
    
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = validatedData.tax || 0;
    const total = subtotal + tax;
    
    // Create new quote
    const quote = new Quote({
      ...validatedData,
      number: quoteNumber,
      items: items.map(item => ({
        name: item.name,
        description: item.description || '',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        total: item.lineTotal, // Map lineTotal to total for schema
        // Don't include itemId if not provided
        ...(item.itemId && { itemId: new mongoose.Types.ObjectId(item.itemId) }),
      })),
      subtotal,
      tax,
      total,
      validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
    });
    
    await quote.save();
    
    return NextResponse.json({
      success: true,
      message: 'Quote created successfully',
      data: quote
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create quote:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Quote number already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create quote', details: error.message },
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
    
    // Get quotes with pagination
    const skip = (page - 1) * limit;
    const quotes = await Quote.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Quote.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        quotes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch quotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    );
  }
}
