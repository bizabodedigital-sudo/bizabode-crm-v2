import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    const { receivedQuantities = {}, performedBy } = body;
    
    // Find the purchase order
    const purchaseOrder = await PurchaseOrder.findById(id);
    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    // Check if PO can be received
    if (purchaseOrder.status === 'received' || purchaseOrder.status === 'completed') {
      return NextResponse.json(
        { error: 'Purchase order has already been received' },
        { status: 400 }
      );
    }
    
    // Update inventory for each item
    const movementLogs = [];
    
    for (const item of purchaseOrder.items) {
      const receivedQty = receivedQuantities[item.itemId?.toString()] || item.quantity;
      
      if (receivedQty > 0 && item.itemId) {
        // Find the inventory item
        const inventoryItem = await Item.findById(item.itemId);
        if (inventoryItem) {
          const previousQuantity = inventoryItem.quantity;
          const newQuantity = previousQuantity + receivedQty;
          
          // Update inventory quantity
          await Item.findByIdAndUpdate(item.itemId, {
            quantity: newQuantity,
            costPrice: item.unitPrice, // Update cost price to latest purchase price
          });
          
          // Log the movement
          const movement = new InventoryMovement({
            itemId: item.itemId,
            movementType: 'purchase',
            quantityChange: receivedQty,
            previousQuantity,
            newQuantity,
            reason: `Purchase Order ${purchaseOrder.number} - Received from supplier`,
            performedBy: performedBy || purchaseOrder.createdBy,
            costPerUnit: item.unitPrice,
            totalCost: receivedQty * item.unitPrice,
            referenceId: purchaseOrder.number,
          });
          
          await movement.save();
          movementLogs.push(movement);
          
          // Update received quantity in PO
          item.receivedQuantity = receivedQty;
        }
      }
    }
    
    // Update purchase order status
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        status: 'received',
        receivedDate: new Date(),
        items: purchaseOrder.items,
      },
      { new: true }
    ).populate('supplierId', 'name email phone address');
    
    return NextResponse.json({
      success: true,
      message: 'Purchase order marked as received successfully',
      data: {
        purchaseOrder: updatedPO,
        movements: movementLogs,
      }
    });
  } catch (error) {
    console.error('Failed to receive purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to receive purchase order' },
      { status: 500 }
    );
  }
}
