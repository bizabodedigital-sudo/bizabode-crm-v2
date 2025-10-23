import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '@/lib/models/Item';
import InventoryMovement from '@/lib/models/InventoryMovement';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build base query
    const baseQuery: any = {};
    if (companyId) baseQuery.companyId = companyId;
    
    // Date range for movements
    const movementQuery: any = { ...baseQuery };
    if (startDate || endDate) {
      movementQuery.createdAt = {};
      if (startDate) movementQuery.createdAt.$gte = new Date(startDate);
      if (endDate) movementQuery.createdAt.$lte = new Date(endDate);
    }
    
    // Get all items for this company
    const items = await Item.find(baseQuery);
    
    // Calculate basic analytics
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const lowStockItems = items.filter(item => item.quantity <= item.reorderLevel && item.quantity > 0);
    const outOfStockItems = items.filter(item => item.quantity === 0);
    const criticalItems = items.filter(item => item.critical);
    
    // Category breakdown
    const categoryBreakdown = items.reduce((acc, item) => {
      const category = item.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalValue: 0,
          items: []
        };
      }
      acc[category].count++;
      acc[category].totalValue += item.quantity * item.unitPrice;
      acc[category].items.push({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      });
      return acc;
    }, {} as any);
    
    // Top items by value
    const topItemsByValue = items
      .map(item => ({
        sku: item.sku,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalValue: item.quantity * item.unitPrice
      }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10);
    
    // Get movement analytics
    const movements = await InventoryMovement.find(movementQuery)
      .populate('itemId', 'sku name category')
      .sort({ createdAt: -1 });
    
    // Movement type breakdown
    const movementTypes = movements.reduce((acc, movement) => {
      const type = movement.movementType;
      if (!acc[type]) {
        acc[type] = { count: 0, totalQuantity: 0 };
      }
      acc[type].count++;
      acc[type].totalQuantity += Math.abs(movement.quantityChange);
      return acc;
    }, {} as any);
    
    // Recent movements (last 10)
    const recentMovements = movements.slice(0, 10).map(movement => ({
      id: movement._id,
      itemSku: movement.itemSku,
      itemName: movement.itemName,
      movementType: movement.movementType,
      quantityChange: movement.quantityChange,
      reason: movement.reason,
      performedByName: movement.performedByName,
      createdAt: movement.createdAt
    }));
    
    // Stock level distribution
    const stockLevels = {
      outOfStock: outOfStockItems.length,
      lowStock: lowStockItems.length,
      inStock: items.filter(item => item.quantity > item.reorderLevel).length,
      critical: criticalItems.length
    };
    
    // Average values
    const averageItemValue = totalItems > 0 ? totalValue / totalItems : 0;
    const averageQuantity = totalItems > 0 ? items.reduce((sum, item) => sum + item.quantity, 0) / totalItems : 0;
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalItems,
          totalValue: Math.round(totalValue * 100) / 100,
          averageItemValue: Math.round(averageItemValue * 100) / 100,
          averageQuantity: Math.round(averageQuantity * 100) / 100,
        },
        stockLevels,
        categoryBreakdown,
        topItemsByValue,
        movementTypes,
        recentMovements,
        lowStockItems: lowStockItems.map(item => ({
          id: item._id,
          sku: item.sku,
          name: item.name,
          category: item.category,
          currentQuantity: item.quantity,
          reorderLevel: item.reorderLevel,
          unitPrice: item.unitPrice,
          critical: item.critical
        })),
        outOfStockItems: outOfStockItems.map(item => ({
          id: item._id,
          sku: item.sku,
          name: item.name,
          category: item.category,
          reorderLevel: item.reorderLevel,
          unitPrice: item.unitPrice,
          critical: item.critical
        }))
      }
    });
    
  } catch (error) {
    console.error('Failed to fetch inventory analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inventory analytics' },
      { status: 500 }
    );
  }
}
