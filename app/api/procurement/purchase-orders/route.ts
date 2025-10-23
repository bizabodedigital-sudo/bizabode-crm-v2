import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Purchase Order schema
const PurchaseOrderSchema = new mongoose.Schema({
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
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'approved', 'sent', 'received', 'completed', 'cancelled'],
    default: 'draft',
  },
  expectedDate: {
    type: Date,
  },
  receivedDate: {
    type: Date,
  },
  total: {
    type: Number,
    default: 0,
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    name: String,
    quantity: Number,
    unitPrice: Number,
    lineTotal: Number,
    receivedQuantity: {
      type: Number,
      default: 0,
    },
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

const PurchaseOrder = mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', PurchaseOrderSchema);

// Validation schema
const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  expectedDate: z.string().optional(),
  items: z.array(z.object({
    itemId: z.string().optional(),
    name: z.string().min(1, 'Item name is required'),
    quantity: z.number().int().positive('Quantity must be positive'),
    unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  createdBy: z.string().min(1, 'Created by is required'),
});

export async function POST(request: NextRequest) {
  try {
    console.log('Creating purchase order...');
    await connectDB();
    
    const body = await request.json();
    console.log('Request body:', body);
    
    // Validate the request body
    const validatedData = purchaseOrderSchema.parse(body);
    console.log('Validated data:', validatedData);
    
    // Generate PO number
    const poNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate totals
    const items = validatedData.items.map(item => ({
      ...item,
      lineTotal: item.quantity * item.unitPrice,
    }));
    
    const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
    
    // Create new purchase order
    const purchaseOrder = new PurchaseOrder({
      ...validatedData,
      number: poNumber,
      items,
      total,
      expectedDate: validatedData.expectedDate ? new Date(validatedData.expectedDate) : undefined,
    });
    
    // Ensure the collection has the correct indexes
    try {
      await PurchaseOrder.collection.createIndex({ number: 1 }, { unique: true });
    } catch (error) {
      // Index might already exist, that's fine
    }
    
    console.log('Saving purchase order...');
    await purchaseOrder.save();
    console.log('Purchase order saved:', purchaseOrder._id);
    
    return NextResponse.json({
      success: true,
      message: 'Purchase order created successfully',
      data: purchaseOrder
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create purchase order:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create purchase order', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching purchase orders...');
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const page = parseInt(searchParams.get('page') || '1');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('companyId') || '';
    
    console.log('Query params:', { limit, page, search, status, companyId });
    
    // Build query
    const query: any = {};
    
    if (companyId) {
      query.companyId = new mongoose.Types.ObjectId(companyId);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { number: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('Query:', query);
    
    // Get purchase orders with pagination
    const skip = (page - 1) * limit;
    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('supplierId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await PurchaseOrder.countDocuments(query);
    
    console.log('Found purchase orders:', purchaseOrders.length);
    
    return NextResponse.json({
      success: true,
      data: {
        purchaseOrders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch purchase orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders', details: error.message },
      { status: 500 }
    );
  }
}