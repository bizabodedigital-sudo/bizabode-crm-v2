import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Employee from '@/lib/models/Employee';
import { z } from 'zod';

// Validation schema
const employeeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  department: z.string().min(1, 'Department is required'),
  salary: z.number().min(0, 'Salary must be non-negative'),
  hireDate: z.string().optional(),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'intern']).optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  createdBy: z.string().min(1, 'Created by is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate the request body
    const validatedData = employeeSchema.parse(body);
    
    // Check if employee ID already exists for this company
    const existingEmployee = await Employee.findOne({
      companyId: validatedData.companyId,
      employeeId: validatedData.employeeId
    });
    
    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee ID already exists for this company' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingEmail = await Employee.findOne({
      companyId: validatedData.companyId,
      email: validatedData.email
    });
    
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists for this company' },
        { status: 400 }
      );
    }
    
    // Create new employee
    const employee = new Employee({
      ...validatedData,
      hireDate: validatedData.hireDate ? new Date(validatedData.hireDate) : new Date(),
      employmentType: validatedData.employmentType || 'full-time',
      status: 'active',
    });
    
    await employee.save();
    
    return NextResponse.json({
      success: true,
      message: 'Employee created successfully',
      data: employee
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create employee:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create employee' },
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
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';
    
    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get employees with pagination
    const skip = (page - 1) * limit;
    const employees = await Employee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Employee.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        employees,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
