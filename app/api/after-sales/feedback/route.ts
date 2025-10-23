import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { z } from 'zod';
import mongoose from 'mongoose';

// Feedback schema
const FeedbackSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['issue', 'suggestion', 'question'],
    required: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  subject: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);

// Validation schema
const feedbackSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  type: z.enum(['issue', 'suggestion', 'question'], {
    errorMap: () => ({ message: 'Type must be issue, suggestion, or question' })
  }),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  subject: z.string().min(1, 'Subject is required'),
  rating: z.number().min(1).max(5).optional(),
  message: z.string().min(1, 'Message is required'),
  companyId: z.string().min(1, 'Company ID is required'),
  createdBy: z.string().min(1, 'Created by is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = feedbackSchema.parse(body);
    
    // Create new feedback
    const feedback = new Feedback({
      ...validatedData,
      priority: validatedData.priority || 'medium',
      status: 'open',
    });
    
    await feedback.save();
    
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
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
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('companyId') || '';
    
    // Build query
    const query: any = {};
    
    if (companyId) {
      query.companyId = companyId;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get feedback with pagination
    const skip = (page - 1) * limit;
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Feedback.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
