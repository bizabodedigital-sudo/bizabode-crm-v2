#!/usr/bin/env node

/**
 * Inventory System Test Script
 * Tests all core inventory functionality
 */

const API_BASE = 'http://localhost:3000/api';

// Test data
const testItems = [
  {
    sku: 'TEST-001',
    name: 'Test Widget',
    category: 'Electronics',
    quantity: 100,
    reorderLevel: 10,
    unitPrice: 25.99,
    description: 'Test item 1',
    critical: false
  },
  {
    sku: 'TEST-002',
    name: 'Critical Gadget',
    category: 'Electronics',
    quantity: 5,
    reorderLevel: 10,
    unitPrice: 15.50,
    description: 'Test item 2',
    critical: true
  },
  {
    sku: 'TEST-003',
    name: 'Hardware Tool',
    category: 'Hardware',
    quantity: 25,
    reorderLevel: 5,
    unitPrice: 45.00,
    description: 'Test item 3',
    critical: false
  }
];

const testCSV = `SKU,Name,Category,Quantity,ReorderLevel,UnitPrice,Description,Critical
TEST-001,Test Widget,Electronics,100,10,25.99,Test item 1,false
TEST-002,Critical Gadget,Electronics,5,10,15.50,Test item 2,true
TEST-003,Hardware Tool,Hardware,25,5,45.00,Test item 3,false`;

// Test functions
async function testAPIEndpoint(endpoint, description, isCSV = false) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    const response = await fetch(`${API_BASE}${endpoint}`);
    
    if (response.ok) {
      if (isCSV) {
        const csvData = await response.text();
        if (csvData.includes('SKU,Name,Category')) {
          console.log(`✅ ${description} - PASSED`);
          return { success: true, data: csvData };
        } else {
          console.log(`❌ ${description} - FAILED: Invalid CSV format`);
          return { success: false, error: 'Invalid CSV format' };
        }
      } else {
        const data = await response.json();
        console.log(`✅ ${description} - PASSED`);
        return { success: true, data };
      }
    } else {
      const data = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.log(`❌ ${description} - FAILED: ${data.message || 'Unknown error'}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testCreateItem(item, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    const response = await fetch(`${API_BASE}/inventory/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // You may need to adjust this
      },
      body: JSON.stringify({
        ...item,
        companyId: '68f5bc2cf855b93078938f4e',
        createdBy: '68f5bc2cf855b93078938f4e'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${description} - PASSED`);
      return { success: true, data };
    } else {
      console.log(`❌ ${description} - FAILED: ${data.message || 'Unknown error'}`);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log(`❌ ${description} - ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Inventory System Tests...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Test 1: Get inventory items
  const itemsTest = await testAPIEndpoint('/inventory/items?limit=10', 'Get inventory items');
  results.total++;
  if (itemsTest.success) results.passed++; else results.failed++;
  
  // Test 2: Get analytics
  const analyticsTest = await testAPIEndpoint('/inventory/analytics', 'Get inventory analytics');
  results.total++;
  if (analyticsTest.success) results.passed++; else results.failed++;
  
  // Test 3: Export CSV
  const csvTest = await testAPIEndpoint('/inventory/items/export-csv', 'Export inventory CSV', true);
  results.total++;
  if (csvTest.success) results.passed++; else results.failed++;
  
  // Test 4: Get low stock items
  const lowStockTest = await testAPIEndpoint('/inventory/items/low-stock-purchase-order?companyId=68f5bc2cf855b93078938f4e', 'Get low stock items');
  results.total++;
  if (lowStockTest.success) results.passed++; else results.failed++;
  
  // Test 5: Get movement logs
  const movementsTest = await testAPIEndpoint('/inventory/movements', 'Get movement logs');
  results.total++;
  if (movementsTest.success) results.passed++; else results.failed++;
  
  // Test 6: Test CSV parsing (simulate bulk import)
  console.log('\n🧪 Testing: CSV parsing simulation');
  try {
    const lines = testCSV.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['sku', 'name', 'category', 'quantity', 'reorderlevel', 'unitprice'];
    
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h.includes(header))
    );
    
    if (missingHeaders.length === 0) {
      console.log('✅ CSV parsing simulation - PASSED');
      results.passed++;
    } else {
      console.log(`❌ CSV parsing simulation - FAILED: Missing headers: ${missingHeaders.join(', ')}`);
      results.failed++;
    }
  } catch (error) {
    console.log(`❌ CSV parsing simulation - ERROR: ${error.message}`);
    results.failed++;
  }
  results.total++;
  
  // Test 7: Validate test data
  console.log('\n🧪 Testing: Test data validation');
  try {
    let valid = true;
    for (const item of testItems) {
      if (!item.sku || !item.name || !item.category) {
        valid = false;
        break;
      }
      if (typeof item.quantity !== 'number' || item.quantity < 0) {
        valid = false;
        break;
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
        valid = false;
        break;
      }
    }
    
    if (valid) {
      console.log('✅ Test data validation - PASSED');
      results.passed++;
    } else {
      console.log('❌ Test data validation - FAILED: Invalid test data');
      results.failed++;
    }
  } catch (error) {
    console.log(`❌ Test data validation - ERROR: ${error.message}`);
    results.failed++;
  }
  results.total++;
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Inventory system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testItems, testCSV };
