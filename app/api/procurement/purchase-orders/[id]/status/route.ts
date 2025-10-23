import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';
import { z } from 'zod';

// Purchase Order schema (same as in main route)
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

const statusUpdateSchema = z.object({
  status: z.enum(['draft', 'approved', 'sent', 'received', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('Status update API called');
    await connectDB();
    const { id } = await params;
    console.log('Purchase Order ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Purchase Order ID' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    const validatedData = statusUpdateSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Use findByIdAndUpdate instead of save
    const updateData: any = { status: validatedData.status };
    if (validatedData.notes) {
      updateData.notes = validatedData.notes;
    }

    console.log('Updating purchase order with:', updateData);
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    console.log('Purchase order updated:', purchaseOrder ? 'Yes' : 'No');

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Purchase order status updated successfully',
      data: { purchaseOrder },
    });
  } catch (error) {
    console.error('Failed to update purchase order status:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase order status' },
      { status: 500 }
    );
  }
}
