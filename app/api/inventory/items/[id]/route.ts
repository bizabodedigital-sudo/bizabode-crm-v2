import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '@/lib/models/Item';
import { z } from 'zod';

// Validation schema for updates
const updateItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required').optional(),
  name: z.string().min(1, 'Item name is required').optional(),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required').optional(),
  quantity: z.number().int().min(0, 'Quantity must be non-negative').optional(),
  reorderLevel: z.number().int().min(0, 'Reorder level must be non-negative').optional(),
  unitPrice: z.number().min(0, 'Unit price must be non-negative').optional(),
  costPrice: z.number().min(0, 'Cost price must be non-negative').optional(),
  critical: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const item = await Item.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: item
    });
    
  } catch (error) {
    console.error('Failed to fetch item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
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
    const validatedData = updateItemSchema.parse(body);
    
    // Check if SKU already exists for this company (if SKU is being updated)
    if (validatedData.sku) {
      const existingItem = await Item.findOne({
        _id: { $ne: id },
        companyId: body.companyId,
        sku: validatedData.sku
      });
      
      if (existingItem) {
        return NextResponse.json(
          { error: 'SKU already exists for this company' },
          { status: 400 }
        );
      }
    }
    
    // Update the item
    const item = await Item.findByIdAndUpdate(
      id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
    
  } catch (error) {
    console.error('Failed to update item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update item' },
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
    const item = await Item.findByIdAndDelete(id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });
    
  } catch (error) {
    console.error('Failed to delete item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
