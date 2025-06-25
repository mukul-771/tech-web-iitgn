#!/usr/bin/env node

// Simple test to verify hackathon storage functions work with extended fields
const { createHackathon, updateHackathon, getHackathonById } = require('./src/lib/hackathons-storage.ts');

async function testStorageFix() {
  console.log('Testing hackathon storage fix...');
  
  try {
    // Test data with extended fields
    const testData = {
      name: "Storage Test Hackathon",
      description: "Testing extended fields storage",
      longDescription: "This tests if extended fields are properly saved and retrieved",
      date: "2025-12-31",
      location: "Test Location",
      category: "AI/ML",
      status: "upcoming",
      
      // Extended fields
      organizerName: "Test Organizer",
      organizerEmail: "test@example.com",
      organizerPhone: "+1234567890",
      organizerWebsite: "https://test.com",
      requirements: "Basic programming knowledge",
      eligibility: "Open to all",
      teamSize: "1-4 members",
      firstPrize: "$1000",
      secondPrize: "$500",
      thirdPrize: "$250",
      timeline: "Registration: Dec 1-15, Event: Dec 20-22",
      importantNotes: "Bring laptop and charger",
      themes: "AI, ML, Data Science",
      judingCriteria: "Innovation, Implementation, Presentation",
      submissionGuidelines: "Submit GitHub repo and demo video"
    };
    
    console.log('Creating hackathon with extended fields...');
    const created = await createHackathon(testData);
    console.log('Created hackathon:', created.id);
    
    console.log('Retrieving hackathon...');
    const retrieved = await getHackathonById(created.id);
    console.log('Retrieved hackathon organizer name:', retrieved?.organizerName);
    console.log('Retrieved hackathon requirements:', retrieved?.requirements);
    console.log('Retrieved hackathon first prize:', retrieved?.firstPrize);
    
    // Test update
    console.log('Updating hackathon with new extended fields...');
    const updateData = {
      ...testData,
      organizerName: "Updated Organizer",
      firstPrize: "$2000",
      timeline: "Updated timeline: Dec 1-20, Event: Dec 25-27"
    };
    
    const updated = await updateHackathon(created.id, updateData);
    console.log('Updated hackathon organizer name:', updated.organizerName);
    console.log('Updated hackathon first prize:', updated.firstPrize);
    console.log('Updated hackathon timeline:', updated.timeline);
    
    console.log('✅ Storage fix test completed successfully!');
    
  } catch (error) {
    console.error('❌ Storage fix test failed:', error);
  }
}

testStorageFix();
