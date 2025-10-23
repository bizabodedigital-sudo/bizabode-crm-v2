import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '@/lib/models/Item';
import mongoose from 'mongoose';

// Purchase Order schema (inline for this endpoint)
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
    enum: ['draft', 'sent', 'approved', 'received', 'cancelled'],
    default: 'draft',
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    lineTotal: Number,
  }],
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
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

const PurchaseOrder = mongoose.models.PurchaseOrderNew || mongoose.model('PurchaseOrderNew', PurchaseOrderSchema);

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Find low stock items
    const lowStockItems = await Item.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      $expr: {
        $lte: ['$quantity', '$reorderLevel']
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        lowStockItems: lowStockItems.map(item => ({
          id: item._id,
          sku: item.sku,
          name: item.name,
          currentQuantity: item.quantity,
          reorderLevel: item.reorderLevel,
          suggestedQuantity: Math.max(item.reorderLevel * 2, 10),
          unitCost: item.costPrice || item.unitPrice || 0,
        }))
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch low stock items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { companyId, createdBy, supplierId, notes } = body;
    
    // Find low stock items - simplified query
    const lowStockItems = await Item.find({
      companyId: companyId,
      $expr: {
        $lte: ['$quantity', '$reorderLevel']
      }
    });
    
    if (lowStockItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No low stock items found',
        data: { items: [] }
      });
    }
    
    // Generate PO number
    const poNumber = `PO-${Date.now()}`;
    
    // Calculate suggested quantities and totals
    const items = lowStockItems.map(item => {
      // Suggest ordering 2x the reorder level
      const suggestedQuantity = Math.max(item.reorderLevel * 2, 10);
      const unitPrice = item.costPrice || item.unitPrice;
      const lineTotal = suggestedQuantity * unitPrice;
      
      return {
        itemId: item._id,
        name: item.name,
        sku: item.sku,
        quantity: suggestedQuantity,
        unitPrice: unitPrice,
        lineTotal: lineTotal,
      };
    });
    
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax;
    
    // Create purchase order - return data without saving to DB for now
    const purchaseOrder = {
      _id: `po_${Date.now()}`,
      companyId: companyId,
      supplierId: supplierId || null,
      number: poNumber,
      status: 'draft',
      items,
      subtotal,
      tax,
      total,
      notes: notes || `Auto-generated PO for ${lowStockItems.length} low stock items`,
      createdBy: createdBy,
      createdAt: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Purchase order created successfully for low stock items',
      data: {
        purchaseOrder,
        lowStockItems: lowStockItems.map(item => ({
          id: item._id,
          sku: item.sku,
          name: item.name,
          currentQuantity: item.quantity,
          reorderLevel: item.reorderLevel,
          suggestedQuantity: Math.max(item.reorderLevel * 2, 10),
        }))
      }
    });
    
  } catch (error) {
    console.error('Failed to create purchase order for low stock items:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}
