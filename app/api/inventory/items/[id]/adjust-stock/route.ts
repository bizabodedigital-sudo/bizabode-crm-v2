import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '@/lib/models/Item';
import InventoryMovement from '@/lib/models/InventoryMovement';
import { z } from 'zod';

// Validation schema for stock adjustment
const adjustStockSchema = z.object({
  adjustment: z.number().int('Adjustment must be an integer'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    // Validate the request body
    const validatedData = adjustStockSchema.parse(body);
    
    const item = await Item.findById(id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    // Calculate new quantity
    const newQuantity = item.quantity + validatedData.adjustment;
    
    if (newQuantity < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock for this adjustment' },
        { status: 400 }
      );
    }
    
    // Update the item
    const updatedItem = await Item.findByIdAndUpdate(
      params.id,
      { 
        quantity: newQuantity,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );
    
    // Log the movement
    const movement = new InventoryMovement({
      companyId: item.companyId,
      itemId: item._id,
      itemSku: item.sku,
      itemName: item.name,
      movementType: 'adjustment',
      quantityChange: validatedData.adjustment,
      previousQuantity: item.quantity,
      newQuantity: newQuantity,
      reason: validatedData.reason,
      notes: validatedData.notes,
      performedBy: body.performedBy || item.companyId, // Fallback to company ID
      performedByName: body.performedByName || 'System',
      costPerUnit: item.costPrice || item.unitPrice,
      totalCost: Math.abs(validatedData.adjustment) * (item.costPrice || item.unitPrice),
    });
    
    await movement.save();
    
    return NextResponse.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        item: updatedItem,
        adjustment: validatedData.adjustment,
        newQuantity: newQuantity,
        reason: validatedData.reason,
        notes: validatedData.notes,
        movement: movement
      }
    });
    
  } catch (error) {
    console.error('Failed to adjust stock:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
