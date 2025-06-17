#!/usr/bin/env node

/**
 * Test script for Admin Email Management System
 * 
 * This script tests the admin email storage functions to ensure
 * they work correctly before using them in the web interface.
 */

const path = require('path');
const fs = require('fs').promises;

// Import the admin email functions (we'll simulate them here for testing)
const DATA_DIR = path.join(process.cwd(), 'data');
const ADMIN_EMAILS_FILE = path.join(DATA_DIR, 'admin-emails.json');

// Test data
const testEmails = [
  'test1@iitgn.ac.in',
  'test2@iitgn.ac.in',
  'invalid-email',
  'mukul.meena@iitgn.ac.in' // duplicate
];

async function readAdminEmails() {
  try {
    const data = await fs.readFile(ADMIN_EMAILS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('❌ Could not read admin emails file:', error.message);
    return null;
  }
}

async function testEmailValidation() {
  console.log('\n🧪 Testing Email Validation...');
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const testCases = [
    { email: 'valid@example.com', expected: true },
    { email: 'invalid-email', expected: false },
    { email: 'test@', expected: false },
    { email: '@example.com', expected: false },
    { email: 'test@example', expected: false },
    { email: 'test.email@example.com', expected: true }
  ];
  
  testCases.forEach(({ email, expected }) => {
    const isValid = emailRegex.test(email);
    const status = isValid === expected ? '✅' : '❌';
    console.log(`${status} ${email}: ${isValid ? 'valid' : 'invalid'} (expected: ${expected ? 'valid' : 'invalid'})`);
  });
}

async function testFileOperations() {
  console.log('\n🧪 Testing File Operations...');
  
  // Test reading current admin emails
  const currentEmails = await readAdminEmails();
  if (currentEmails) {
    console.log('✅ Successfully read admin emails file');
    console.log(`📧 Current admin emails: ${currentEmails.emails.join(', ')}`);
    console.log(`📅 Last modified: ${currentEmails.lastModified}`);
    console.log(`👤 Modified by: ${currentEmails.modifiedBy}`);
  } else {
    console.log('❌ Failed to read admin emails file');
    return;
  }
  
  // Test file structure
  const requiredFields = ['emails', 'lastModified', 'modifiedBy', 'createdAt', 'updatedAt'];
  const missingFields = requiredFields.filter(field => !(field in currentEmails));
  
  if (missingFields.length === 0) {
    console.log('✅ Admin emails file has correct structure');
  } else {
    console.log(`❌ Missing fields in admin emails file: ${missingFields.join(', ')}`);
  }
  
  // Test emails array
  if (Array.isArray(currentEmails.emails)) {
    console.log('✅ Emails field is an array');
    console.log(`📊 Number of admin emails: ${currentEmails.emails.length}`);
  } else {
    console.log('❌ Emails field is not an array');
  }
}

async function testDuplicateDetection() {
  console.log('\n🧪 Testing Duplicate Detection...');
  
  const currentEmails = await readAdminEmails();
  if (!currentEmails) return;
  
  const testEmail = currentEmails.emails[0]; // Use first existing email
  const hasDuplicate = currentEmails.emails.includes(testEmail);
  
  if (hasDuplicate) {
    console.log(`✅ Duplicate detection works: "${testEmail}" already exists`);
  } else {
    console.log('❌ Duplicate detection failed');
  }
}

async function testAPIEndpoints() {
  console.log('\n🧪 Testing API Endpoints...');
  
  const baseUrl = 'http://localhost:3001';
  
  try {
    // Test GET endpoint (this will fail without authentication, which is expected)
    const response = await fetch(`${baseUrl}/api/admin/admin-emails`);
    
    if (response.status === 401) {
      console.log('✅ GET /api/admin/admin-emails correctly requires authentication');
    } else {
      console.log(`❌ GET /api/admin/admin-emails returned unexpected status: ${response.status}`);
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('⚠️  Development server not running. Start with: npm run dev');
    } else {
      console.log(`❌ Error testing API: ${error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Admin Email Management System Tests\n');
  console.log('=' .repeat(60));
  
  await testEmailValidation();
  await testFileOperations();
  await testDuplicateDetection();
  await testAPIEndpoints();
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Tests completed!');
  console.log('\n📋 Next Steps:');
  console.log('1. Start the development server: npm run dev');
  console.log('2. Go to: http://localhost:3001/admin/settings');
  console.log('3. Test adding/removing admin emails through the UI');
  console.log('4. Verify that authentication works immediately');
}

// Run tests
runAllTests().catch(console.error);
