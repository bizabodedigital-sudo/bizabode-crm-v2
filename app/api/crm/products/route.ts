import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Product from '@/lib/models/Product'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const lowStock = searchParams.get('lowStock')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (category) query.category = category
    if (status) query.status = status
    if (lowStock === 'true') query['stock.available'] = { $lte: query['stock.reorderLevel'] || 0 }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ]
    }

    // Get products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Product.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      companyId,
      name,
      description,
      sku,
      category,
      subcategory,
      brand,
      unit,
      price,
      cost,
      images,
      specifications,
      dimensions,
      stock,
      pricing,
      status,
      tags,
      isDigital,
      requiresShipping,
      taxCategory,
      supplier
    } = body

    // Validate required fields
    if (!companyId || !name || !description || !sku || !category || !unit || !price || !cost) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, name, description, sku, category, unit, price, cost' 
      }, { status: 400 })
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ companyId, sku })
    if (existingProduct) {
      return NextResponse.json({ 
        error: 'Product with this SKU already exists' 
      }, { status: 400 })
    }

    // Create product
    const product = new Product({
      companyId,
      name,
      description,
      sku,
      category,
      subcategory,
      brand,
      unit,
      price,
      cost,
      images: images || [],
      specifications: specifications || {},
      dimensions: dimensions || {},
      stock: {
        quantity: stock?.quantity || 0,
        reserved: stock?.reserved || 0,
        available: stock?.quantity || 0,
        reorderLevel: stock?.reorderLevel || 0,
        reorderQuantity: stock?.reorderQuantity || 0,
      },
      pricing: {
        basePrice: price,
        volumeDiscounts: pricing?.volumeDiscounts || [],
        customerSpecificPricing: pricing?.customerSpecificPricing || [],
        promotionalPricing: pricing?.promotionalPricing || [],
      },
      status: status || 'Active',
      tags: tags || [],
      isDigital: isDigital || false,
      requiresShipping: requiresShipping !== false,
      taxCategory,
      supplier: supplier || {}
    })

    await product.save()

    return NextResponse.json({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
