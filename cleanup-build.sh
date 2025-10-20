#!/bin/bash

# PDF Build Cleanup Script
# This script completely cleans the build to eliminate Helvetica.afm errors

echo "🧹 PDF Build Cleanup Script"
echo "============================"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from your project root."
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo ""

# Step 1: Remove build artifacts
echo "1. Removing build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf dist
rm -rf build
echo "✅ Build artifacts removed"
echo ""

# Step 2: Clean node_modules
echo "2. Cleaning node_modules..."
rm -rf node_modules
echo "✅ node_modules removed"
echo ""

# Step 3: Clean package-lock.json
echo "3. Cleaning package-lock.json..."
rm -f package-lock.json
echo "✅ package-lock.json removed"
echo ""

# Step 4: Reinstall dependencies
echo "4. Reinstalling dependencies..."
npm install
echo "✅ Dependencies reinstalled"
echo ""

# Step 5: Check PDFKit version
echo "5. Checking PDFKit version..."
PDFKIT_VERSION=$(npm list pdfkit 2>/dev/null | grep pdfkit | awk '{print $2}' | sed 's/@//')
if [ -n "$PDFKIT_VERSION" ]; then
    echo "📦 PDFKit version: $PDFKIT_VERSION"
    
    # Check if version is older than 0.14.0
    if [[ "$PDFKIT_VERSION" < "0.14.0" ]]; then
        echo "⚠️  PDFKit version is older than 0.14.0"
        echo "   Upgrading PDFKit to latest version..."
        npm install pdfkit@latest
        echo "✅ PDFKit upgraded"
    else
        echo "✅ PDFKit version is up to date"
    fi
else
    echo "❌ PDFKit not found in dependencies"
fi
echo ""

# Step 6: Build the project
echo "6. Building the project..."
npm run build
echo "✅ Project built successfully"
echo ""

# Step 7: Check for .afm references
echo "7. Checking for .afm references..."
if grep -r "afm" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.md" --exclude="*.sh" --exclude="*.js" > /dev/null 2>&1; then
    echo "⚠️  Found .afm references in codebase:"
    grep -r "afm" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git --exclude="*.md" --exclude="*.sh" --exclude="*.js"
else
    echo "✅ No .afm references found"
fi
echo ""

# Step 8: Final verification
echo "8. Final verification..."
if [ -d ".next" ]; then
    echo "✅ Build directory created"
else
    echo "❌ Build directory not found"
fi

if [ -d "node_modules" ]; then
    echo "✅ node_modules directory created"
else
    echo "❌ node_modules directory not found"
fi
echo ""

echo "🎉 Cleanup complete!"
echo ""
echo "Next steps:"
echo "1. Start your application: npm run start"
echo "2. Test PDF generation"
echo "3. Check console logs for font-related messages"
echo ""
echo "If you still see Helvetica.afm errors, check:"
echo "- Third-party PDF libraries in node_modules"
echo "- Custom font registration in your code"
echo "- PDFKit version compatibility"
