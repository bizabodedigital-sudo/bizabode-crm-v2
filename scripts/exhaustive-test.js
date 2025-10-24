const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// EVERY SINGLE PAGE in the application
const ALL_PAGES = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/inventory',
  '/inventory/analytics',
  '/crm',
  '/crm/leads',
  '/crm/opportunities',
  '/crm/customers',
  '/crm/quotes',
  '/crm/sales-orders',
  '/crm/invoices',
  '/crm/payments',
  '/crm/deliveries',
  '/crm/activities',
  '/crm/credit-limits',
  '/crm/promotions',
  '/crm/documents',
  '/crm/products',
  '/crm/approvals',
  '/crm/reports',
  '/crm/tasks',
  '/hr',
  '/hr/employees',
  '/hr/attendance',
  '/hr/attendance-summary',
  '/hr/leaves',
  '/hr/leave-approvals',
  '/hr/payroll',
  '/hr/reports',
  '/procurement',
  '/procurement/purchase-orders',
  '/procurement/purchase-orders/new',
  '/procurement/suppliers',
  '/settings',
  '/settings/company',
  '/settings/users',
  '/settings/customization',
  '/license',
  '/employee',
  '/employee/clock',
  '/employee/login',
  '/after-sales',
  '/feedback',
  '/reports'
];

// EVERY SINGLE API ENDPOINT
const ALL_API_ENDPOINTS = [
  // Auth endpoints
  { method: 'GET', path: '/api/health', needsAuth: false },
  { method: 'POST', path: '/api/auth/login', needsAuth: false },
  { method: 'POST', path: '/api/auth/register', needsAuth: false },
  { method: 'GET', path: '/api/auth/me', needsAuth: true },
  
  // Inventory endpoints
  { method: 'GET', path: '/api/inventory/items', needsAuth: true },
  { method: 'POST', path: '/api/inventory/items', needsAuth: true },
  { method: 'GET', path: '/api/inventory/analytics', needsAuth: true },
  { method: 'GET', path: '/api/inventory/movements', needsAuth: true },
  
  // CRM endpoints
  { method: 'GET', path: '/api/leads', needsAuth: true },
  { method: 'POST', path: '/api/leads', needsAuth: true },
  { method: 'GET', path: '/api/opportunities', needsAuth: true },
  { method: 'POST', path: '/api/opportunities', needsAuth: true },
  { method: 'GET', path: '/api/crm/customers', needsAuth: true },
  { method: 'POST', path: '/api/crm/customers', needsAuth: true },
  { method: 'GET', path: '/api/crm/quotes', needsAuth: true },
  { method: 'POST', path: '/api/crm/quotes', needsAuth: true },
  { method: 'GET', path: '/api/crm/invoices', needsAuth: true },
  { method: 'POST', path: '/api/crm/invoices', needsAuth: true },
  { method: 'GET', path: '/api/crm/sales-orders', needsAuth: true },
  { method: 'GET', path: '/api/crm/deliveries', needsAuth: true },
  { method: 'GET', path: '/api/crm/activities', needsAuth: true },
  { method: 'GET', path: '/api/crm/tasks', needsAuth: true },
  
  // HR endpoints
  { method: 'GET', path: '/api/hr/employees', needsAuth: true },
  { method: 'POST', path: '/api/hr/employees', needsAuth: true },
  { method: 'GET', path: '/api/hr/leave-requests', needsAuth: true },
  
  // Procurement endpoints
  { method: 'GET', path: '/api/procurement/purchase-orders', needsAuth: true },
  { method: 'GET', path: '/api/procurement/suppliers', needsAuth: true },
  
  // System endpoints
  { method: 'GET', path: '/api/users', needsAuth: true },
  { method: 'GET', path: '/api/company', needsAuth: true },
  { method: 'GET', path: '/api/license/status', needsAuth: true },
  { method: 'GET', path: '/api/notifications', needsAuth: true },
  
  // Public endpoints
  { method: 'POST', path: '/api/public/leads/capture', needsAuth: false }
];

class ExhaustiveTester {
  constructor() {
    this.results = {
      pages: { working: 0, errors: 0, total: 0 },
      apis: { working: 0, errors: 0, total: 0 },
      features: { working: 0, errors: 0, total: 0 }
    };
    this.token = null;
    this.detailedResults = [];
  }

  async authenticate() {
    console.log('🔐 Authenticating...');
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'rojay@bizabode.com',
        password: 'password123'
      });
      this.token = response.data.token;
      console.log('✅ Authentication successful');
      return true;
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.status);
      return false;
    }
  }

  async testAllPages() {
    console.log('\n📄 TESTING EVERY SINGLE PAGE...');
    this.results.pages.total = ALL_PAGES.length;
    
    for (const page of ALL_PAGES) {
      try {
        const response = await axios.get(`${BASE_URL}${page}`, {
          timeout: 10000,
          validateStatus: (status) => status < 500
        });
        
        const status = response.status;
        const hasContent = response.data.length > 1000; // Basic content check
        const hasTitle = response.data.includes('Bizabode');
        
        if (status === 200 && hasContent && hasTitle) {
          console.log(`✅ ${page} - Working (${status}, ${response.data.length} bytes)`);
          this.results.pages.working++;
          this.detailedResults.push({ type: 'page', item: page, status: 'working', details: `${status}, ${response.data.length} bytes` });
        } else {
          console.log(`⚠️ ${page} - Issues (${status}, content: ${hasContent}, title: ${hasTitle})`);
          this.results.pages.errors++;
          this.detailedResults.push({ type: 'page', item: page, status: 'error', details: `${status}, content issues` });
        }
      } catch (error) {
        console.log(`❌ ${page} - Error: ${error.message}`);
        this.results.pages.errors++;
        this.detailedResults.push({ type: 'page', item: page, status: 'error', details: error.message });
      }
    }
  }

  async testAllAPIs() {
    console.log('\n🔌 TESTING EVERY SINGLE API ENDPOINT...');
    this.results.apis.total = ALL_API_ENDPOINTS.length;
    
    for (const endpoint of ALL_API_ENDPOINTS) {
      try {
        const headers = endpoint.needsAuth && this.token ? 
          { Authorization: `Bearer ${this.token}` } : {};
        
        let response;
        if (endpoint.method === 'GET') {
          response = await axios.get(`${BASE_URL}${endpoint.path}`, {
            headers,
            timeout: 5000,
            validateStatus: (status) => status < 500
          });
        } else if (endpoint.method === 'POST') {
          // Use minimal valid data for POST tests
          const testData = this.getTestData(endpoint.path);
          response = await axios.post(`${BASE_URL}${endpoint.path}`, testData, {
            headers,
            timeout: 5000,
            validateStatus: (status) => status < 500
          });
        }
        
        if (response.status === 200 || response.status === 201) {
          console.log(`✅ ${endpoint.method} ${endpoint.path} - Working (${response.status})`);
          this.results.apis.working++;
          this.detailedResults.push({ type: 'api', item: `${endpoint.method} ${endpoint.path}`, status: 'working', details: response.status });
        } else if (response.status === 401) {
          console.log(`🔒 ${endpoint.method} ${endpoint.path} - Unauthorized (401)`);
          this.results.apis.errors++;
          this.detailedResults.push({ type: 'api', item: `${endpoint.method} ${endpoint.path}`, status: 'unauthorized', details: '401' });
        } else if (response.status === 404) {
          console.log(`❌ ${endpoint.method} ${endpoint.path} - Not Found (404)`);
          this.results.apis.errors++;
          this.detailedResults.push({ type: 'api', item: `${endpoint.method} ${endpoint.path}`, status: 'not_found', details: '404' });
        } else {
          console.log(`⚠️ ${endpoint.method} ${endpoint.path} - Status ${response.status}`);
          this.results.apis.errors++;
          this.detailedResults.push({ type: 'api', item: `${endpoint.method} ${endpoint.path}`, status: 'error', details: response.status });
        }
      } catch (error) {
        console.log(`💥 ${endpoint.method} ${endpoint.path} - Error: ${error.response?.status || error.message}`);
        this.results.apis.errors++;
        this.detailedResults.push({ type: 'api', item: `${endpoint.method} ${endpoint.path}`, status: 'error', details: error.response?.status || error.message });
      }
    }
  }

  getTestData(path) {
    // Minimal valid test data for different endpoints
    const testDataMap = {
      '/api/auth/login': { email: 'test@test.com', password: 'password' },
      '/api/auth/register': { name: 'Test User', email: 'test@test.com', password: 'password', companyName: 'Test Co', licenseKey: 'TEST' },
      '/api/inventory/items': { sku: 'TEST-001', name: 'Test Item', category: 'Test', quantity: 1, reorderLevel: 1, unitPrice: 1 },
      '/api/leads': { name: 'Test Lead', email: 'test@test.com', phone: '123', company: 'Test Co', source: 'Test', status: 'new' },
      '/api/opportunities': { title: 'Test Opp', customerName: 'Test', customerEmail: 'test@test.com', value: 1000, stage: 'qualification', probability: 50 },
      '/api/crm/customers': { companyName: 'Test Co', contactPerson: 'Test Person', email: 'test@test.com', phone: '123', category: 'Other', customerType: 'Commercial', paymentTerms: 'Net 30', status: 'Active' },
      '/api/hr/employees': { firstName: 'Test', lastName: 'Employee', email: 'test@test.com', department: 'Test', position: 'Test', salary: 50000 },
      '/api/public/leads/capture': { name: 'Test Lead', email: 'test@test.com', phone: '123', company: 'Test Co', source: 'Website' }
    };
    
    return testDataMap[path] || {};
  }

  async testCRUDOperations() {
    console.log('\n🔄 TESTING EVERY CRUD OPERATION...');
    
    const crudTests = [
      {
        name: 'Inventory Items',
        endpoints: {
          create: { method: 'POST', path: '/api/inventory/items' },
          read: { method: 'GET', path: '/api/inventory/items' },
          update: { method: 'PUT', path: '/api/inventory/items/test-id' },
          delete: { method: 'DELETE', path: '/api/inventory/items/test-id' }
        }
      },
      {
        name: 'Leads',
        endpoints: {
          create: { method: 'POST', path: '/api/leads' },
          read: { method: 'GET', path: '/api/leads' },
          update: { method: 'PUT', path: '/api/leads/test-id' },
          delete: { method: 'DELETE', path: '/api/leads/test-id' }
        }
      },
      {
        name: 'Customers',
        endpoints: {
          create: { method: 'POST', path: '/api/crm/customers' },
          read: { method: 'GET', path: '/api/crm/customers' },
          update: { method: 'PUT', path: '/api/crm/customers/test-id' },
          delete: { method: 'DELETE', path: '/api/crm/customers/test-id' }
        }
      }
    ];

    for (const crudTest of crudTests) {
      console.log(`\n📝 Testing ${crudTest.name} CRUD:`);
      
      for (const [operation, endpoint] of Object.entries(crudTest.endpoints)) {
        try {
          const headers = this.token ? { Authorization: `Bearer ${this.token}` } : {};
          let response;
          
          if (endpoint.method === 'GET') {
            response = await axios.get(`${BASE_URL}${endpoint.path}`, { headers, timeout: 5000, validateStatus: (status) => status < 500 });
          } else if (endpoint.method === 'POST') {
            const testData = this.getTestData(endpoint.path);
            response = await axios.post(`${BASE_URL}${endpoint.path}`, testData, { headers, timeout: 5000, validateStatus: (status) => status < 500 });
          } else if (endpoint.method === 'PUT') {
            response = await axios.put(`${BASE_URL}${endpoint.path}`, {}, { headers, timeout: 5000, validateStatus: (status) => status < 500 });
          } else if (endpoint.method === 'DELETE') {
            response = await axios.delete(`${BASE_URL}${endpoint.path}`, { headers, timeout: 5000, validateStatus: (status) => status < 500 });
          }
          
          if (response.status < 400) {
            console.log(`  ✅ ${operation.toUpperCase()} - Working (${response.status})`);
            this.results.features.working++;
          } else {
            console.log(`  ❌ ${operation.toUpperCase()} - Error (${response.status})`);
            this.results.features.errors++;
          }
        } catch (error) {
          console.log(`  💥 ${operation.toUpperCase()} - Error: ${error.response?.status || error.message}`);
          this.results.features.errors++;
        }
        this.results.features.total++;
      }
    }
  }

  async testSpecialFeatures() {
    console.log('\n🎯 TESTING SPECIAL FEATURES...');
    
    const specialTests = [
      {
        name: 'File Upload',
        test: async () => {
          // Test file upload endpoint
          const FormData = require('form-data');
          const form = new FormData();
          form.append('file', 'test content', 'test.txt');
          
          try {
            const response = await axios.post(`${BASE_URL}/api/files/upload`, form, {
              headers: { 
                ...form.getHeaders(),
                Authorization: `Bearer ${this.token}`
              },
              timeout: 5000,
              validateStatus: (status) => status < 500
            });
            return { success: response.status < 400, status: response.status };
          } catch (error) {
            return { success: false, error: error.response?.status || error.message };
          }
        }
      },
      {
        name: 'CSV Export',
        test: async () => {
          try {
            const response = await axios.get(`${BASE_URL}/api/inventory/items/export-csv`, {
              headers: { Authorization: `Bearer ${this.token}` },
              timeout: 5000,
              validateStatus: (status) => status < 500
            });
            return { success: response.status < 400, status: response.status };
          } catch (error) {
            return { success: false, error: error.response?.status || error.message };
          }
        }
      },
      {
        name: 'PDF Generation',
        test: async () => {
          try {
            const response = await axios.get(`${BASE_URL}/api/quotes/test-id/download-pdf`, {
              headers: { Authorization: `Bearer ${this.token}` },
              timeout: 5000,
              validateStatus: (status) => status < 500
            });
            return { success: response.status < 400, status: response.status };
          } catch (error) {
            return { success: false, error: error.response?.status || error.message };
          }
        }
      },
      {
        name: 'Email Sending',
        test: async () => {
          try {
            const response = await axios.post(`${BASE_URL}/api/quotes/test-id/email`, {
              to: 'test@test.com',
              subject: 'Test Quote'
            }, {
              headers: { Authorization: `Bearer ${this.token}` },
              timeout: 5000,
              validateStatus: (status) => status < 500
            });
            return { success: response.status < 400, status: response.status };
          } catch (error) {
            return { success: false, error: error.response?.status || error.message };
          }
        }
      }
    ];

    for (const test of specialTests) {
      console.log(`🧪 Testing ${test.name}...`);
      const result = await test.test();
      
      if (result.success) {
        console.log(`  ✅ ${test.name} - Working`);
        this.results.features.working++;
      } else {
        console.log(`  ❌ ${test.name} - Error: ${result.error || result.status}`);
        this.results.features.errors++;
      }
      this.results.features.total++;
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 EXHAUSTIVE TESTING COMPLETE - FINAL REPORT');
    console.log('='.repeat(80));
    
    console.log('\n📄 PAGE TESTING RESULTS:');
    console.log(`✅ Working: ${this.results.pages.working}/${this.results.pages.total} (${Math.round((this.results.pages.working/this.results.pages.total)*100)}%)`);
    console.log(`❌ Errors: ${this.results.pages.errors}/${this.results.pages.total} (${Math.round((this.results.pages.errors/this.results.pages.total)*100)}%)`);
    
    console.log('\n🔌 API TESTING RESULTS:');
    console.log(`✅ Working: ${this.results.apis.working}/${this.results.apis.total} (${Math.round((this.results.apis.working/this.results.apis.total)*100)}%)`);
    console.log(`❌ Errors: ${this.results.apis.errors}/${this.results.apis.total} (${Math.round((this.results.apis.errors/this.results.apis.total)*100)}%)`);
    
    console.log('\n🎯 FEATURE TESTING RESULTS:');
    console.log(`✅ Working: ${this.results.features.working}/${this.results.features.total} (${Math.round((this.results.features.working/this.results.features.total)*100)}%)`);
    console.log(`❌ Errors: ${this.results.features.errors}/${this.results.features.total} (${Math.round((this.results.features.errors/this.results.features.total)*100)}%)`);
    
    const totalTests = this.results.pages.total + this.results.apis.total + this.results.features.total;
    const totalWorking = this.results.pages.working + this.results.apis.working + this.results.features.working;
    
    console.log('\n🏆 OVERALL RESULTS:');
    console.log(`✅ Total Working: ${totalWorking}/${totalTests} (${Math.round((totalWorking/totalTests)*100)}%)`);
    console.log(`❌ Total Issues: ${totalTests - totalWorking}/${totalTests} (${Math.round(((totalTests - totalWorking)/totalTests)*100)}%)`);
    
    // Save detailed report
    fs.writeFileSync('exhaustive-test-report.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: this.results,
      details: this.detailedResults
    }, null, 2));
    
    console.log('\n📋 Detailed report saved to: exhaustive-test-report.json');
  }

  async runExhaustiveTest() {
    console.log('🚀 STARTING EXHAUSTIVE APPLICATION TEST...');
    console.log('This will test EVERY page, API endpoint, and feature systematically.\n');
    
    // Authenticate first
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }
    
    // Test everything
    await this.testAllPages();
    await this.testAllAPIs();
    await this.testCRUDOperations();
    await this.testSpecialFeatures();
    
    // Generate final report
    this.generateReport();
  }
}

// Run the exhaustive test
const tester = new ExhaustiveTester();
tester.runExhaustiveTest().catch(console.error);
"
