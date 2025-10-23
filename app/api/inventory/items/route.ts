import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '@/lib/models/Item';
import { z } from 'zod';

// Validation schema
const itemSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Item name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().int().min(0, 'Quantity must be non-negative'),
  reorderLevel: z.number().int().min(0, 'Reorder level must be non-negative'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  costPrice: z.number().min(0, 'Cost price must be non-negative').optional(),
  critical: z.boolean().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = itemSchema.parse(body);
    
    // Check if SKU already exists for this company
    const existingItem = await Item.findOne({
      companyId: validatedData.companyId,
      sku: validatedData.sku
    });
    
    if (existingItem) {
      return NextResponse.json(
        { error: 'SKU already exists for this company' },
        { status: 400 }
      );
    }
    
    // Create new item
    const item = new Item({
      ...validatedData,
      costPrice: validatedData.costPrice || validatedData.unitPrice,
      critical: validatedData.critical || false,
    });
    
    await item.save();
    
    return NextResponse.json({
      success: true,
      message: 'Inventory item created successfully',
      data: item
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create inventory item:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
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
    const category = searchParams.get('category') || '';
    const lowStock = searchParams.get('lowStock') === 'true';
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock) {
      query.$expr = { $lte: ['$quantity', '$reorderLevel'] };
    }
    
    // Get items with pagination
    const skip = (page - 1) * limit;
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Item.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch inventory items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory items' },
      { status: 500 }
    );
  }
}
