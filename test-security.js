#!/usr/bin/env node

/**
 * Security Test Script
 * Tests admin route protection and API security
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

async function testSecurity() {
  console.log('🔒 Testing Admin Security...\n');

  const tests = [
    {
      name: 'Admin Dashboard Access (Unauthenticated)',
      url: `${BASE_URL}/admin`,
      expectedStatus: 302, // Redirect to login
      description: 'Should redirect to login page'
    },
    {
      name: 'Admin API Access (Unauthenticated)',
      url: `${BASE_URL}/api/admin/events`,
      expectedStatus: 401, // Unauthorized
      description: 'Should return 401 Unauthorized'
    },
    {
      name: 'Admin Login Page Access',
      url: `${BASE_URL}/admin/login`,
      expectedStatus: 200, // Should be accessible
      description: 'Should be accessible to everyone'
    },
    {
      name: 'Admin Settings API (Unauthenticated)',
      url: `${BASE_URL}/api/admin/settings`,
      expectedStatus: 401, // Unauthorized
      description: 'Should return 401 Unauthorized'
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const response = await fetch(test.url, {
        redirect: 'manual' // Don't follow redirects
      });

      const status = response.status;
      const success = status === test.expectedStatus;

      if (success) {
        console.log(`✅ PASS - Status: ${status} (Expected: ${test.expectedStatus})`);
        passed++;
      } else {
        console.log(`❌ FAIL - Status: ${status} (Expected: ${test.expectedStatus})`);
        failed++;
      }

      console.log(`   ${test.description}\n`);

    } catch (error) {
      console.log(`❌ ERROR - ${error.message}\n`);
      failed++;
    }
  }

  console.log('📊 Security Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

  if (failed === 0) {
    console.log('🎉 All security tests passed! Your admin system is secure.');
  } else {
    console.log('⚠️  Some security tests failed. Please review the implementation.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testSecurity().catch(console.error);
}

module.exports = { testSecurity };
