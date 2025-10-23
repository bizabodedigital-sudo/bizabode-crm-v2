import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Delivery schema
const DeliverySchema = new mongoose.Schema({
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
  customerName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  driver: {
    type: String,
  },
  status: {
    type: String,
    enum: ['scheduled', 'in-transit', 'delivered', 'cancelled'],
    default: 'scheduled',
  },
  note: {
    type: String,
  },
  deliveredAt: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

const Delivery = mongoose.models.Delivery || mongoose.model('Delivery', DeliverySchema);

// Validation schema
const deliverySchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  address: z.string().min(1, 'Address is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  driver: z.string().optional(),
  note: z.string().optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  createdBy: z.string().min(1, 'Created by is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = deliverySchema.parse(body);
    
    // Generate delivery number
    const deliveryNumber = `DEL-${Date.now()}`;
    
    // Create new delivery
    const delivery = new Delivery({
      ...validatedData,
      number: deliveryNumber,
      scheduledDate: new Date(validatedData.scheduledDate),
    });
    
    await delivery.save();
    
    return NextResponse.json({
      success: true,
      message: 'Delivery created successfully',
      data: delivery
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create delivery:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create delivery' },
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
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('companyId') || '';
    
    // Build query
    const query: any = {};
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { number: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get deliveries with pagination
    const skip = (page - 1) * limit;
    const deliveries = await Delivery.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Delivery.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        deliveries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch deliveries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}
