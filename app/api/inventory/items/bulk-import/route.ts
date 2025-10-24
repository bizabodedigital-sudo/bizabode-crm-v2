import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '@/lib/models/Item';
import { authenticateToken } from '@/lib/middleware/auth';
import { z } from 'zod';

// Validation schema for bulk import
const bulkItemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  reorderLevel: z.number().int().min(0, 'Reorder level must be non-negative'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  costPrice: z.number().min(0, 'Cost price must be non-negative').optional(),
  critical: z.boolean().optional(),
});

const bulkImportSchema = z.object({
  items: z.array(bulkItemSchema).min(1, 'At least one item is required'),
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Authenticate the request
    const authResult = await authenticateToken(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = bulkImportSchema.parse(body);
    
    const results = {
      success: [],
      errors: [],
      total: validatedData.items.length
    };
    
    // Process each item
    for (let i = 0; i < validatedData.items.length; i++) {
      const itemData = validatedData.items[i];
      
      try {
        // Check if SKU already exists
        const existingItem = await Item.findOne({
          companyId: validatedData.companyId,
          sku: itemData.sku
        });
        
        if (existingItem) {
          results.errors.push({
            index: i,
            sku: itemData.sku,
            error: 'SKU already exists for this company'
          });
          continue;
        }
        
        // Create new item
        const item = new Item({
          ...itemData,
          companyId: validatedData.companyId,
          createdBy: authResult.user.id,
          costPrice: itemData.costPrice || itemData.unitPrice,
          critical: itemData.critical || false,
        });
        
        await item.save();
        
        results.success.push({
          index: i,
          sku: itemData.sku,
          name: itemData.name,
          id: item._id
        });
        
      } catch (error) {
        results.errors.push({
          index: i,
          sku: itemData.sku,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Bulk import completed: ${results.success.length} successful, ${results.errors.length} errors`,
      data: results
    });
    
  } catch (error) {
    console.error('Failed to bulk import items:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to bulk import items' },
      { status: 500 }
    );
  }
}
