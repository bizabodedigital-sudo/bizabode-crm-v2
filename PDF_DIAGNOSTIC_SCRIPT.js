#!/usr/bin/env node

/**
 * PDF Font Diagnostic Script
 * 
 * This script helps diagnose PDFKit font issues and provides
 * cleanup commands to eliminate Helvetica.afm errors.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PDF Font Diagnostic Script');
console.log('================================\n');

// Check for .afm references in the codebase
console.log('1. Checking for .afm file references...');
try {
  const { execSync } = require('child_process');
  
  try {
    const afmResults = execSync('grep -r "afm" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git', { encoding: 'utf8' });
    if (afmResults.trim()) {
      console.log('❌ Found .afm references:');
      console.log(afmResults);
    } else {
      console.log('✅ No .afm references found in codebase');
    }
  } catch (error) {
    console.log('✅ No .afm references found (grep returned no results)');
  }
} catch (error) {
  console.log('⚠️  Could not run grep command');
}

// Check for Helvetica.afm references
console.log('\n2. Checking for Helvetica.afm references...');
try {
  const { execSync } = require('child_process');
  
  try {
    const helveticaResults = execSync('grep -r "Helvetica.afm" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git', { encoding: 'utf8' });
    if (helveticaResults.trim()) {
      console.log('❌ Found Helvetica.afm references:');
      console.log(helveticaResults);
    } else {
      console.log('✅ No Helvetica.afm references found');
    }
  } catch (error) {
    console.log('✅ No Helvetica.afm references found (grep returned no results)');
  }
} catch (error) {
  console.log('⚠️  Could not run grep command');
}

// Check PDFKit version
console.log('\n3. Checking PDFKit version...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const pdfkitVersion = packageJson.dependencies?.pdfkit || packageJson.devDependencies?.pdfkit;
  
  if (pdfkitVersion) {
    console.log(`📦 PDFKit version: ${pdfkitVersion}`);
    
    // Check if version is older than 0.14.0
    const version = pdfkitVersion.replace(/[^0-9.]/g, '');
    const [major, minor] = version.split('.').map(Number);
    
    if (major < 1 && minor < 14) {
      console.log('⚠️  PDFKit version is older than 0.14.0 - this may cause .afm issues');
      console.log('   Consider upgrading: npm install pdfkit@latest');
    } else {
      console.log('✅ PDFKit version looks good');
    }
  } else {
    console.log('❌ PDFKit not found in package.json');
  }
} catch (error) {
  console.log('⚠️  Could not read package.json');
}

// Check for build artifacts
console.log('\n4. Checking for build artifacts...');
const buildDirs = ['.next', 'node_modules/.cache', 'dist', 'build'];
buildDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Found build directory: ${dir}`);
  } else {
    console.log(`✅ No build directory: ${dir}`);
  }
});

// Provide cleanup commands
console.log('\n🧹 CLEANUP COMMANDS');
console.log('===================');
console.log('Run these commands to completely clean your build:');
console.log('');
console.log('# Remove all build artifacts');
console.log('rm -rf .next');
console.log('rm -rf node_modules/.cache');
console.log('');
console.log('# Clean install dependencies');
console.log('rm -rf node_modules');
console.log('npm install');
console.log('');
console.log('# Rebuild the project');
console.log('npm run build');
console.log('');
console.log('# Start the application');
console.log('npm run start');
console.log('');

// Test PDFKit font behavior
console.log('🧪 PDFKit Font Test');
console.log('===================');
console.log('To test if PDFKit is working correctly, run this in your app:');
console.log('');
console.log(`
// Add this to any API route to test PDFKit font behavior
import PDFDocument from 'pdfkit';

const testPDF = () => {
  const doc = new PDFDocument({ font: 'Helvetica' });
  
  console.log('Testing PDFKit font behavior...');
  
  try {
    doc.font('Helvetica');
    console.log('✅ Helvetica font set successfully');
  } catch (error) {
    console.log('❌ Helvetica font failed:', error);
  }
  
  try {
    doc.font('Helvetica-Bold');
    console.log('✅ Helvetica-Bold font set successfully');
  } catch (error) {
    console.log('❌ Helvetica-Bold font failed:', error);
  }
  
  doc.end();
  console.log('✅ PDFKit test completed');
};

testPDF();
`);

console.log('\n🎯 NEXT STEPS');
console.log('=============');
console.log('1. Run the cleanup commands above');
console.log('2. Test PDF generation in your app');
console.log('3. Check the console logs for font-related messages');
console.log('4. If issues persist, check for third-party PDF libraries');
console.log('');

console.log('✅ Diagnostic complete!');
