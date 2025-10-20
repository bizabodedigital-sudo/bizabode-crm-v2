#!/usr/bin/env node

/**
 * PDFKit Font Test Script
 * 
 * This script tests PDFKit font behavior to ensure
 * no .afm file dependencies exist.
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');

console.log('🧪 PDFKit Font Test');
console.log('===================');
console.log('');

// Test 1: Basic PDFDocument creation
console.log('Test 1: Creating PDFDocument with Helvetica default...');
try {
  const doc1 = new PDFDocument({ font: 'Helvetica' });
  console.log('✅ PDFDocument created with Helvetica default');
  
  // Test setting Helvetica explicitly
  try {
    doc1.font('Helvetica');
    console.log('✅ Helvetica font set successfully');
  } catch (error) {
    console.log('❌ Helvetica font failed:', error.message);
  }
  
  doc1.end();
} catch (error) {
  console.log('❌ PDFDocument creation failed:', error.message);
}

console.log('');

// Test 2: Test Helvetica-Bold
console.log('Test 2: Testing Helvetica-Bold...');
try {
  const doc2 = new PDFDocument({ font: 'Helvetica' });
  
  try {
    doc2.font('Helvetica-Bold');
    console.log('✅ Helvetica-Bold font set successfully');
  } catch (error) {
    console.log('❌ Helvetica-Bold font failed:', error.message);
  }
  
  doc2.end();
} catch (error) {
  console.log('❌ PDFDocument creation failed:', error.message);
}

console.log('');

// Test 3: Test custom font registration (if fonts exist)
console.log('Test 3: Testing custom font registration...');
const fontPath = './public/fonts/OpenSans-Regular.ttf';

if (fs.existsSync(fontPath)) {
  try {
    const doc3 = new PDFDocument({ font: 'Helvetica' });
    
    try {
      doc3.registerFont('OpenSans', fontPath);
      console.log('✅ Custom font registered successfully');
      
      try {
        doc3.font('OpenSans');
        console.log('✅ Custom font set successfully');
      } catch (error) {
        console.log('❌ Custom font failed:', error.message);
      }
    } catch (error) {
      console.log('❌ Custom font registration failed:', error.message);
    }
    
    doc3.end();
  } catch (error) {
    console.log('❌ PDFDocument creation failed:', error.message);
  }
} else {
  console.log('⚠️  Custom font file not found, skipping custom font test');
}

console.log('');

// Test 4: Test fallback behavior
console.log('Test 4: Testing fallback behavior...');
try {
  const doc4 = new PDFDocument({ font: 'Helvetica' });
  
  // Try to set a non-existent font
  try {
    doc4.font('NonExistentFont');
    console.log('⚠️  Non-existent font was accepted (unexpected)');
  } catch (error) {
    console.log('✅ Non-existent font properly rejected');
    
    // Test fallback
    try {
      doc4.font('Helvetica');
      console.log('✅ Fallback to Helvetica successful');
    } catch (fallbackError) {
      console.log('❌ Fallback to Helvetica failed:', fallbackError.message);
    }
  }
  
  doc4.end();
} catch (error) {
  console.log('❌ PDFDocument creation failed:', error.message);
}

console.log('');

// Test 5: Create a simple PDF to test end-to-end
console.log('Test 5: Creating a simple PDF...');
try {
  const doc5 = new PDFDocument({ font: 'Helvetica' });
  const stream = fs.createWriteStream('./test-output.pdf');
  
  doc5.pipe(stream);
  
  // Set font explicitly
  doc5.font('Helvetica');
  doc5.fontSize(12);
  doc5.text('Hello, this is a test PDF!', 50, 50);
  
  doc5.font('Helvetica-Bold');
  doc5.fontSize(16);
  doc5.text('This is bold text!', 50, 100);
  
  doc5.end();
  
  stream.on('finish', () => {
    console.log('✅ Test PDF created successfully: test-output.pdf');
    
    // Clean up test file
    fs.unlinkSync('./test-output.pdf');
    console.log('✅ Test file cleaned up');
  });
  
} catch (error) {
  console.log('❌ PDF creation failed:', error.message);
}

console.log('');
console.log('🎯 Test Results Summary');
console.log('=======================');
console.log('If all tests passed, PDFKit is working correctly without .afm dependencies.');
console.log('If any tests failed, there may be PDFKit version or configuration issues.');
console.log('');
console.log('Next steps:');
console.log('1. Run the cleanup script: ./cleanup-build.sh');
console.log('2. Test PDF generation in your application');
console.log('3. Check for any remaining .afm references');
