import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LeaveRequest from '@/lib/models/LeaveRequest';
import { z } from 'zod';

// Validation schema
const leaveRequestSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveType: z.enum(['sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason too long'),
  companyId: z.string().min(1, 'Company ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = leaveRequestSchema.parse(body);
    
    // Calculate total days
    const startDate = new Date(validatedData.startDate);
    const endDate = new Date(validatedData.endDate);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Create new leave request
    const leaveRequest = new LeaveRequest({
      ...validatedData,
      startDate,
      endDate,
      totalDays,
      status: 'pending',
    });
    
    await leaveRequest.save();
    
    return NextResponse.json({
      success: true,
      message: 'Leave request created successfully',
      data: leaveRequest
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create leave request:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create leave request' },
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
    const leaveType = searchParams.get('leaveType') || '';
    const companyId = searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    // Build query
    const query: any = { companyId };
    
    if (search) {
      query.$or = [
        { reason: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (leaveType) {
      query.leaveType = leaveType;
    }
    
    // Get leave requests with pagination
    const skip = (page - 1) * limit;
    const leaveRequests = await LeaveRequest.find(query)
      .populate('employeeId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await LeaveRequest.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        leaveRequests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch leave requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leave requests' },
      { status: 500 }
    );
  }
}
