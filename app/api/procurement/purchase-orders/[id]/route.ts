import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Purchase Order schema (same as in route.ts)
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

// Item schema for inventory updates
const ItemSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 0,
  },
  reorderLevel: {
    type: Number,
    default: 0,
  },
  unitPrice: {
    type: Number,
    default: 0,
  },
  costPrice: {
    type: Number,
    default: 0,
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

// Inventory Movement schema
const InventoryMovementSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  movementType: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'transfer', 'return'],
    required: true,
  },
  quantityChange: {
    type: Number,
    required: true,
  },
  previousQuantity: {
    type: Number,
    required: true,
  },
  newQuantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  costPerUnit: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  referenceId: {
    type: String, // PO number or other reference
  },
}, {
  timestamps: true,
});

const InventoryMovement = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', InventoryMovementSchema);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const purchaseOrder = await PurchaseOrder.findById(id)
      .populate('supplierId', 'name email phone address')
      .populate('items.itemId', 'sku name category');
    
    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error('Failed to fetch purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
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
    
    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    // Update purchase order
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      { ...body },
      { new: true }
    ).populate('supplierId', 'name email phone address');
    
    return NextResponse.json({
      success: true,
      message: 'Purchase order updated successfully',
      data: updatedPO
    });
  } catch (error) {
    console.error('Failed to update purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
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
    
    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    // Only allow deletion of draft purchase orders
    if (purchaseOrder.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft purchase orders can be deleted' },
        { status: 400 }
      );
    }
    
    await PurchaseOrder.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Purchase order deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to delete purchase order' },
      { status: 500 }
    );
  }
}
