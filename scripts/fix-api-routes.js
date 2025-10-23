#!/usr/bin/env node

/**
 * Fix Next.js 15 API route parameter types
 * Updates all API routes to use Promise<{ id: string }> for params
 */

const fs = require('fs');
const path = require('path');

// Files to fix
const filesToFix = [
  'app/api/inventory/items/[id]/route.ts',
  'app/api/crm/quotes/[id]/email/route.ts',
  'app/api/crm/invoices/[id]/email/route.ts',
  'app/api/crm/quotes/[id]/download-pdf/route.ts',
  'app/api/crm/invoices/[id]/download-pdf/route.ts',
  'app/api/crm/deliveries/[id]/complete/route.ts'
];

function fixApiRoute(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Fix params type from { params: { id: string } } to { params: Promise<{ id: string }> }
    const oldParamsPattern = /{ params }: { params: { id: string } }/g;
    if (content.match(oldParamsPattern)) {
      content = content.replace(oldParamsPattern, '{ params }: { params: Promise<{ id: string }> }');
      modified = true;
    }
    
    // Fix params usage from params.id to await params then destructure
    const oldParamsUsagePattern = /const { id } = params;/g;
    if (content.match(oldParamsUsagePattern)) {
      content = content.replace(oldParamsUsagePattern, 'const { id } = await params;');
      modified = true;
    }
    
    // Fix direct params.id usage
    const directParamsPattern = /params\.id/g;
    if (content.match(directParamsPattern)) {
      // First, we need to await params at the beginning of the function
      const functionStartPattern = /(export async function \w+\(\s*request: NextRequest,\s*{ params }: { params: Promise<{ id: string }> }\s*\)\s*{\s*try\s*{)/;
      if (content.match(functionStartPattern)) {
        content = content.replace(functionStartPattern, (match) => {
          return match + '\n    const { id } = await params;';
        });
      }
      
      // Then replace params.id with id
      content = content.replace(/params\.id/g, 'id');
      modified = true;
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Fix all files
console.log('🔧 Fixing Next.js 15 API route parameter types...\n');

filesToFix.forEach(fixApiRoute);

console.log('\n✅ All API routes fixed!');
