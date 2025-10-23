import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Supplier schema
const SupplierSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'US' }
  },
  contactPerson: {
    type: String,
    trim: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Compound index for unique supplier per company
SupplierSchema.index({ companyId: 1, email: 1 }, { unique: true });

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);

// Validation schema
const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  contactPerson: z.string().optional(),
  taxId: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = supplierSchema.parse(body);
    
    // Check if supplier email already exists for this company
    const existingSupplier = await Supplier.findOne({
      companyId: validatedData.companyId,
      email: validatedData.email
    });
    
    if (existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier email already exists for this company' },
        { status: 400 }
      );
    }
    
    // Create new supplier
    const supplier = new Supplier({
      ...validatedData,
      isActive: true,
    });
    
    await supplier.save();
    
    return NextResponse.json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create supplier:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create supplier' },
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
    const companyId = searchParams.get('companyId') || '';
    
    // Build query
    const query: any = {};
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get suppliers with pagination
    const skip = (page - 1) * limit;
    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Supplier.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}
