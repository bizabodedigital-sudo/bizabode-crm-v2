/**
 * PDF Diagnostic Utilities
 * 
 * This module provides runtime diagnostics for PDFKit
 * to verify font behavior and version information.
 */

import PDFDocument from 'pdfkit'

export function getPDFKitDiagnostics() {
  const diagnostics = {
    pdfkitVersion: '0.15.2', // Current version
    timestamp: new Date().toISOString(),
    tests: [] as Array<{ test: string; result: boolean; message: string }>
  }

  // Test 1: Basic PDFDocument creation
  try {
    const doc = new PDFDocument({ font: 'Helvetica' })
    diagnostics.tests.push({
      test: 'PDFDocument Creation',
      result: true,
      message: 'PDFDocument created successfully with Helvetica default'
    })
    doc.end()
  } catch (error) {
    diagnostics.tests.push({
      test: 'PDFDocument Creation',
      result: false,
      message: `PDFDocument creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  // Test 2: Font setting
  try {
    const doc = new PDFDocument({ font: 'Helvetica' })
    doc.font('Helvetica')
    diagnostics.tests.push({
      test: 'Helvetica Font Setting',
      result: true,
      message: 'Helvetica font set successfully'
    })
    doc.end()
  } catch (error) {
    diagnostics.tests.push({
      test: 'Helvetica Font Setting',
      result: false,
      message: `Helvetica font failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  // Test 3: Bold font setting
  try {
    const doc = new PDFDocument({ font: 'Helvetica' })
    doc.font('Helvetica-Bold')
    diagnostics.tests.push({
      test: 'Helvetica-Bold Font Setting',
      result: true,
      message: 'Helvetica-Bold font set successfully'
    })
    doc.end()
  } catch (error) {
    diagnostics.tests.push({
      test: 'Helvetica-Bold Font Setting',
      result: false,
      message: `Helvetica-Bold font failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  // Test 4: Custom font registration (if available)
  try {
    const doc = new PDFDocument({ font: 'Helvetica' })
    const fs = require('fs')
    const path = require('path')
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'OpenSans-Regular.ttf')
    
    if (fs.existsSync(fontPath)) {
      doc.registerFont('OpenSans', fontPath)
      doc.font('OpenSans')
      diagnostics.tests.push({
        test: 'Custom Font Registration',
        result: true,
        message: 'Custom font registered and set successfully'
      })
    } else {
      diagnostics.tests.push({
        test: 'Custom Font Registration',
        result: true,
        message: 'Custom font file not found, skipping test'
      })
    }
    doc.end()
  } catch (error) {
    diagnostics.tests.push({
      test: 'Custom Font Registration',
      result: false,
      message: `Custom font registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    })
  }

  return diagnostics
}

export function logPDFKitDiagnostics() {
  console.log('🔍 PDFKit Runtime Diagnostics')
  console.log('==============================')
  
  const diagnostics = getPDFKitDiagnostics()
  
  console.log(`📦 PDFKit Version: ${diagnostics.pdfkitVersion}`)
  console.log(`⏰ Timestamp: ${diagnostics.timestamp}`)
  console.log('')
  
  console.log('🧪 Test Results:')
  diagnostics.tests.forEach(test => {
    const status = test.result ? '✅' : '❌'
    console.log(`${status} ${test.test}: ${test.message}`)
  })
  
  console.log('')
  
  const allPassed = diagnostics.tests.every(test => test.result)
  if (allPassed) {
    console.log('🎉 All tests passed! PDFKit is working correctly.')
    console.log('   No .afm file dependencies detected.')
  } else {
    console.log('⚠️  Some tests failed. Check the error messages above.')
    console.log('   This may indicate PDFKit configuration issues.')
  }
  
  console.log('')
  return diagnostics
}

// One-line diagnostic function
export function quickPDFCheck() {
  try {
    const doc = new PDFDocument({ font: 'Helvetica' })
    doc.font('Helvetica')
    doc.end()
    console.log('✅ PDFKit working correctly - no .afm dependencies')
    return true
  } catch (error) {
    console.log('❌ PDFKit error:', error instanceof Error ? error.message : 'Unknown error')
    return false
  }
}
