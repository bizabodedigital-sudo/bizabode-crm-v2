import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Item } from '@/lib/models/Item';
import { 
  validateAuthToken, 
  checkRateLimit, 
  corsHeaders, 
  securityHeaders,
  validateAndSanitizeInput,
  inventoryItemSchema,
  sanitizeInput
} from '@/lib/security';
import { 
  ErrorHandler, 
  createSuccessResponse, 
  createValidationError,
  createAuthenticationError,
  createRateLimitError,
  createDatabaseError,
  createNotFoundError,
  generateRequestId,
  asyncHandler
} from '@/lib/error-handler';

// Production-ready POST handler
export const POST = asyncHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const errorHandler = ErrorHandler.getInstance();
  errorHandler.setRequestId(requestId);

  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimit = checkRateLimit(clientIP, 'api');
    if (!rateLimit.allowed) {
      throw createRateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`);
    }

    // Authentication
    const authResult = validateAuthToken(request);
    if (!authResult.valid) {
      throw createAuthenticationError(authResult.error);
    }

    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validation = validateAndSanitizeInput(body, inventoryItemSchema);
    
    if (!validation.success) {
      throw createValidationError('Invalid input data', { errors: validation.errors });
    }

    const validatedData = validation.data!;

    // Sanitize string inputs
    validatedData.sku = sanitizeInput(validatedData.sku);
    validatedData.name = sanitizeInput(validatedData.name);
    validatedData.description = validatedData.description ? sanitizeInput(validatedData.description) : undefined;
    validatedData.category = sanitizeInput(validatedData.category);

    // Check for duplicate SKU
    const existingItem = await Item.findOne({
      sku: validatedData.sku,
      companyId: validatedData.companyId
    });

    if (existingItem) {
      throw createValidationError('SKU already exists', { 
        sku: validatedData.sku,
        existingItemId: existingItem._id 
      });
    }

    // Create new item
    const newItem = new Item({
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedItem = await newItem.save();

    // Log successful creation
    console.log(`[SUCCESS] Item created: ${savedItem._id} by user: ${authResult.userId}`);

    return createSuccessResponse(
      { item: savedItem },
      'Item created successfully'
    );

  } catch (error) {
    return errorHandler.handleError(error as Error, request);
  }
});

// Production-ready GET handler
export const GET = asyncHandler(async (request: NextRequest) => {
  const requestId = generateRequestId();
  const errorHandler = ErrorHandler.getInstance();
  errorHandler.setRequestId(requestId);

  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    
    const rateLimit = checkRateLimit(clientIP, 'api');
    if (!rateLimit.allowed) {
      throw createRateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds`);
    }

    // Authentication
    const authResult = validateAuthToken(request);
    if (!authResult.valid) {
      throw createAuthenticationError(authResult.error);
    }

    // Connect to database
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 items per request
    const search = sanitizeInput(searchParams.get('search') || '');
    const category = sanitizeInput(searchParams.get('category') || '');
    const lowStock = searchParams.get('lowStock') === 'true';
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      throw createValidationError('Company ID is required');
    }

    // Build query
    const query: any = { companyId };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (lowStock) {
      query.$expr = { $lte: ['$quantity', '$reorderLevel'] };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [items, totalCount] = await Promise.all([
      Item.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return createSuccessResponse({
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    return errorHandler.handleError(error as Error, request);
  }
});

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      ...corsHeaders,
      ...securityHeaders
    }
  });
}
