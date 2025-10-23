import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Supplier schema (same as in route.ts)
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

const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', SupplierSchema);

// Validation schema
const supplierUpdateSchema = z.object({
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
  isActive: z.boolean().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const supplier = await Supplier.findById(id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Failed to fetch supplier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = supplierUpdateSchema.parse(body);
    
    // Check if supplier exists
    const existingSupplier = await Supplier.findById(id);
    if (!existingSupplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    // Check if email already exists for another supplier in the same company
    const duplicateSupplier = await Supplier.findOne({
      _id: { $ne: id },
      companyId: validatedData.companyId,
      email: validatedData.email
    });
    
    if (duplicateSupplier) {
      return NextResponse.json(
        { error: 'Supplier email already exists for this company' },
        { status: 400 }
      );
    }
    
    // Update supplier
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Supplier updated successfully',
      data: updatedSupplier
    });
  } catch (error) {
    console.error('Failed to update supplier:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    const supplier = await Supplier.findByIdAndDelete(id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}
