import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Invoice schema (same as in main route)
const InvoiceSchema = new mongoose.Schema({
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
  customerEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'overdue'],
    default: 'unpaid',
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  tax: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    default: 0,
  },
  paidTotal: {
    type: Number,
    default: 0,
  },
  items: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: false,
    },
    name: String,
    description: String,
    quantity: Number,
    unitPrice: Number,
    lineTotal: Number,
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
});

const Invoice = mongoose.models.InvoiceNew || mongoose.model('InvoiceNew', InvoiceSchema);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    
    const invoice = await Invoice.findById(id);
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // For now, return a simple HTML response that can be printed as PDF
    // In a real application, you'd use a PDF library like Puppeteer or jsPDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 30px; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .items-table th { background-color: #f2f2f2; }
          .total-section { text-align: right; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>#${invoice.number}</h2>
        </div>
        
        <div class="invoice-details">
          <p><strong>Bill To:</strong></p>
          <p>${invoice.customerName}</p>
          <p>${invoice.customerEmail}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>$${item.unitPrice.toFixed(2)}</td>
                <td>$${item.lineTotal.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="total-section">
          <p><strong>Subtotal: $${invoice.subtotal.toFixed(2)}</strong></p>
          <p><strong>Tax: $${invoice.tax.toFixed(2)}</strong></p>
          <p><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
        </div>
        
        ${invoice.notes ? `<div class="notes"><p><strong>Notes:</strong> ${invoice.notes}</p></div>` : ''}
        
        <div class="footer">
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="invoice-${invoice.number}.html"`,
      },
    });
    
  } catch (error) {
    console.error('Failed to generate invoice PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice PDF' },
      { status: 500 }
    );
  }
}
