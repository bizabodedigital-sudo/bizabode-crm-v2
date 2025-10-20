/**
 * PDF Integration Example
 * 
 * This file demonstrates how to integrate the enhanced PDF templates
 * with your existing Bizabode CRM system.
 */

import { generateEnhancedInvoicePDF, generateEnhancedPayslipPDF } from './enhanced-pdf-generator'

// Example: Enhanced Invoice Generation
export async function generateInvoiceWithEnhancedTemplate(invoiceId: string, companyId: string) {
  try {
    // Fetch invoice data from your database
    const invoice = await fetchInvoiceData(invoiceId)
    const company = await fetchCompanyData(companyId)
    
    // Add legal compliance fields to company if not present
    const enhancedCompany = {
      ...company,
      trn: company.trn || 'TRN-TO-BE-ADDED',
      gctNumber: company.gctNumber || 'GCT-TO-BE-ADDED',
      businessRegistration: company.businessRegistration || 'BR-TO-BE-ADDED',
      bankDetails: company.bankDetails || {
        bankName: 'Your Bank Name',
        accountNumber: 'Your Account Number',
        routingNumber: 'Your Routing Number'
      }
    }
    
    // Generate enhanced PDF
    const pdfBuffer = await generateEnhancedInvoicePDF(invoice, enhancedCompany)
    
    return pdfBuffer
  } catch (error) {
    console.error('Enhanced invoice generation failed:', error)
    throw error
  }
}

// Example: Enhanced Payslip Generation
export async function generatePayslipWithEnhancedTemplate(payrollId: string, companyId: string) {
  try {
    // Fetch payroll data from your database
    const payroll = await fetchPayrollData(payrollId)
    const company = await fetchCompanyData(companyId)
    
    // Generate enhanced PDF
    const pdfBuffer = await generateEnhancedPayslipPDF(payroll, company)
    
    return pdfBuffer
  } catch (error) {
    console.error('Enhanced payslip generation failed:', error)
    throw error
  }
}

// Helper functions (replace with your actual database queries)
async function fetchInvoiceData(invoiceId: string) {
  // Replace with your actual database query
  return {
    invoiceNumber: 'INV-2025-0001',
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    customerName: 'John Smith',
    customerAddress: '123 Main St, Kingston, Jamaica',
    customerEmail: 'john@example.com',
    customerPhone: '+1-876-555-0123',
    purchaseOrderNumber: 'PO-2025-001',
    preparedBy: 'Sales Team',
    paymentTerms: 'Net 30 days',
    notes: 'Thank you for your business!',
    items: [
      {
        description: 'Professional Services',
        quantity: 10,
        unitPrice: 100.00,
        tax: 0.15,
        total: 1000.00
      }
    ],
    subtotal: 1000.00,
    tax: 150.00,
    total: 1150.00
  }
}

async function fetchPayrollData(payrollId: string) {
  // Replace with your actual database query
  return {
    payPeriod: {
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31')
    },
    paymentDate: new Date('2025-02-05'),
    employeeId: {
      firstName: 'John',
      lastName: 'Smith',
      employeeId: 'EMP001',
      position: 'Sales Manager',
      department: 'Sales',
      trn: '987654321'
    },
    items: [
      { type: 'earning', description: 'Basic Salary', amount: 5000.00 },
      { type: 'earning', description: 'Overtime Pay', amount: 500.00 },
      { type: 'deduction', description: 'Income Tax (PAYE)', amount: 750.00 },
      { type: 'deduction', description: 'NIS Contribution', amount: 150.00 }
    ],
    grossPay: 5500.00,
    deductions: 900.00,
    netPay: 4600.00,
    paymentMethod: 'Bank Transfer'
  }
}

async function fetchCompanyData(companyId: string) {
  // Replace with your actual database query
  return {
    name: 'Bizabode Solutions Ltd',
    address: '456 Business Ave, Kingston, Jamaica',
    phone: '+1-876-555-0100',
    email: 'info@bizabode.com',
    logo: '/path/to/logo.png',
    trn: '123456789',
    gctNumber: 'GCT-2025-001',
    businessRegistration: 'BR-2025-001',
    bankDetails: {
      bankName: 'National Commercial Bank',
      accountNumber: '1234567890',
      routingNumber: 'NCBJJMXXX'
    }
  }
}

// Example: Frontend integration
export function downloadEnhancedInvoice(invoiceId: string) {
  fetch(`/api/invoices/${invoiceId}/download-enhanced-pdf`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('bizabode_token')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Invoice download failed')
    }
    return response.blob()
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoiceId}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  })
  .catch(error => {
    console.error('Invoice download failed:', error)
  })
}

export function downloadEnhancedPayslip(payrollId: string) {
  fetch(`/api/payroll/${payrollId}/download-enhanced-payslip`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('bizabode_token')}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Payslip download failed')
    }
    return response.blob()
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payslip-${payrollId}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  })
  .catch(error => {
    console.error('Payslip download failed:', error)
  })
}
