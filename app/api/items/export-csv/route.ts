import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Item from '@/lib/models/Item'
import Company from '@/lib/models/Company'
import { generateInventoryTemplate } from '@/lib/utils/print-templates'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    // Get all items for the company
    const items = await Item.find({ 
      companyId: authResult.user.companyId,
      isActive: true 
    }).sort({ category: 1, name: 1 })

    // Get company information
    const company = await Company.findById(authResult.user.companyId)

    // Create CSV content
    const csvHeader = [
      'Item Code',
      'SKU',
      'Item Name',
      'Category',
      'Description',
      'Current Stock',
      'Reorder Level',
      'Unit Price',
      'Cost Price',
      'Supplier',
      'Location',
      'Critical Item',
      'Last Updated'
    ]

    const csvRows = items.map(item => [
      item.sku,
      item.sku,
      `"${item.name}"`,
      item.category,
      `"${item.description || ''}"`,
      item.quantity.toString(),
      item.reorderLevel.toString(),
      item.unitPrice.toFixed(2),
      item.costPrice.toFixed(2),
      `"${item.supplier || ''}"`,
      `"${item.location || ''}"`,
      item.critical ? 'Yes' : 'No',
      new Date(item.updatedAt).toLocaleDateString()
    ])

    const csvContent = [
      csvHeader.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    // Add company header
    const companyHeader = [
      `"${company?.name || 'Company'} - Inventory Stock Check"`,
      `"Generated on: ${new Date().toLocaleDateString()}"`,
      `"Total Items: ${items.length}"`,
      `"Low Stock Items: ${items.filter(item => item.quantity <= item.reorderLevel).length}"`,
      ''
    ].join('\n')

    const fullCsvContent = companyHeader + csvContent

    // Check if PDF format is requested
    const url = new URL(request.url)
    const format = url.searchParams.get('format')
    
    if (format === 'pdf') {
      // Generate PDF template
      const pdfBuffer = await generateInventoryTemplate(items, company)
      
      const response = new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="inventory-stock-check-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })
      
      return response
    } else {
      // Return CSV format
      const response = new NextResponse(fullCsvContent)
      response.headers.set('Content-Type', 'text/csv')
      response.headers.set('Content-Disposition', `attachment; filename="inventory-stock-check-${new Date().toISOString().split('T')[0]}.csv"`)
      
      return response
    }

  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json(
      { error: 'Failed to export inventory data' },
      { status: 500 }
    )
  }
}
