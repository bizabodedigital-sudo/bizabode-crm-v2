import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LeaveRequest from '@/lib/models/LeaveRequest';
import { z } from 'zod';
import mongoose from 'mongoose';

const approveLeaveSchema = z.object({
  action: z.enum(['approve', 'reject']),
  approvedBy: z.string().min(1, 'Approver ID is required'),
  rejectionReason: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid Leave Request ID' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = approveLeaveSchema.parse(body);

    const leaveRequest = await LeaveRequest.findById(id);

    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    if (leaveRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Leave request has already been processed' }, { status: 400 });
    }

    // Update the leave request
    leaveRequest.status = validatedData.action === 'approve' ? 'approved' : 'rejected';
    leaveRequest.approvedBy = new mongoose.Types.ObjectId(validatedData.approvedBy);
    leaveRequest.approvedAt = new Date();
    
    if (validatedData.action === 'reject' && validatedData.rejectionReason) {
      leaveRequest.rejectionReason = validatedData.rejectionReason;
    }

    await leaveRequest.save();

    return NextResponse.json({
      success: true,
      message: `Leave request ${validatedData.action}d successfully`,
      data: leaveRequest
    });
  } catch (error) {
    console.error('Failed to process leave request:', error);
    return NextResponse.json(
      { error: 'Failed to process leave request' },
      { status: 500 }
    );
  }
}
