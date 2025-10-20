#!/usr/bin/env node

/**
 * PDF Fix Verification Script
 * 
 * This script verifies that the Helvetica.afm error has been fixed
 * by testing PDF generation with the updated code.
 */

const { generateInvoicePDF } = require('./lib/utils/pdf-generator.ts');

console.log('🔍 Verifying PDF Fix');
console.log('====================');
console.log('');

// Test data
const testInvoice = {
  invoiceNumber: 'TEST-001',
  invoiceDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerAddress: '123 Test Street, Test City, TC 12345',
  items: [
    {
      description: 'Test Item 1',
      quantity: 1,
      unitPrice: 100.00,
      total: 100.00
    },
    {
      description: 'Test Item 2',
      quantity: 2,
      unitPrice: 50.00,
      total: 100.00
    }
  ],
  subtotal: 200.00,
  taxRate: 0.10,
  tax: 20.00,
  discount: 0,
  total: 220.00,
  notes: 'This is a test invoice to verify PDF generation works without .afm errors.'
};

const testCompany = {
  name: 'Test Company',
  address: '456 Company Street, Company City, CC 67890',
  phone: '(555) 123-4567',
  email: 'info@testcompany.com',
  website: 'www.testcompany.com'
};

console.log('📋 Test Data:');
console.log(`   Invoice: ${testInvoice.invoiceNumber}`);
console.log(`   Customer: ${testInvoice.customerName}`);
console.log(`   Total: $${testInvoice.total}`);
console.log(`   Company: ${testCompany.name}`);
console.log('');

console.log('🧪 Testing PDF Generation...');

// Test PDF generation
generateInvoicePDF(testInvoice, testCompany)
  .then((pdfBuffer) => {
    console.log('✅ PDF generated successfully!');
    console.log(`   Size: ${pdfBuffer.length} bytes`);
    console.log('');
    
    console.log('🎉 SUCCESS: No Helvetica.afm errors detected!');
    console.log('   The PDF generation is working correctly with built-in fonts.');
    console.log('');
    
    console.log('✅ Verification complete!');
    console.log('   Your PDF generation should now work without .afm file errors.');
  })
  .catch((error) => {
    console.log('❌ PDF generation failed:');
    console.log(`   Error: ${error.message}`);
    console.log('');
    
    if (error.message.includes('Helvetica.afm') || error.message.includes('.afm')) {
      console.log('⚠️  Helvetica.afm error still present!');
      console.log('   This indicates the build cache may not have been cleared properly.');
      console.log('');
      console.log('🔧 Try running these commands:');
      console.log('   rm -rf .next');
      console.log('   npm run build');
      console.log('   npm run start');
    } else {
      console.log('ℹ️  This appears to be a different error, not related to .afm files.');
    }
  });
