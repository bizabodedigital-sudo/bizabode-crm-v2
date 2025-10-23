import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import InventoryMovement from '@/lib/models/InventoryMovement';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const companyId = searchParams.get('companyId');
    const itemId = searchParams.get('itemId');
    const movementType = searchParams.get('movementType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build query
    const query: any = {};
    if (companyId) query.companyId = companyId;
    if (itemId) query.itemId = itemId;
    if (movementType) query.movementType = movementType;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch movements with pagination
    const movements = await InventoryMovement.find(query)
      .populate('itemId', 'sku name category')
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await InventoryMovement.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        movements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch inventory movements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory movements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create new movement record
    const movement = new InventoryMovement({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await movement.save();
    
    return NextResponse.json({
      success: true,
      message: 'Inventory movement recorded successfully',
      data: movement
    }, { status: 201 });
    
  } catch (error) {
    console.error('Failed to create inventory movement:', error);
    return NextResponse.json(
      { error: 'Failed to create inventory movement' },
      { status: 500 }
    );
  }
}
