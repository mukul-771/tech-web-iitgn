// Test script for Inter-IIT Achievements System
// Run with: node test-inter-iit-achievements.js

const BASE_URL = 'http://localhost:3000';

async function testInterIITAchievements() {
  console.log('🧪 Testing Inter-IIT Achievements System\n');

  try {
    // Test 1: Check if API is accessible
    console.log('1. Testing API accessibility...');
    const response = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements`);
    
    if (!response.ok) {
      console.error(`❌ API not accessible: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }

    const achievements = await response.json();
    console.log(`✅ API accessible - Found ${achievements.length} achievements\n`);

    // Test 2: Try to create a new achievement
    console.log('2. Testing achievement creation...');
    const testAchievement = {
      achievementType: "bronze-medal",
      competitionName: "Test Competition",
      interIITEdition: "Inter-IIT Tech Meet 13.0",
      year: "2024",
      hostIIT: "IIT Bombay", 
      location: "Mumbai, Maharashtra",
      ranking: 3,
      achievementDescription: "Test achievement for debugging purposes",
      significance: "This is a test achievement to verify the system is working",
      competitionCategory: "Testing",
      achievementDate: "2024-06-25",
      points: 85,
      status: "verified",
      teamMembers: [
        {
          name: "Test Student",
          rollNumber: "24110001",
          branch: "Computer Science and Engineering",
          year: "2nd Year",
          role: "Team Lead",
          email: "test.student@iitgn.ac.in",
          achievements: ["Test Achievement"]
        }
      ]
    };

    const createResponse = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAchievement)
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error(`❌ Failed to create achievement: ${createResponse.status}`);
      console.error('Error details:', error);
      return;
    }

    const newAchievement = await createResponse.json();
    console.log(`✅ Achievement created successfully with ID: ${newAchievement.id}\n`);

    // Test 3: Try to update the achievement
    console.log('3. Testing achievement update...');
    const updateData = {
      ...testAchievement,
      achievementDescription: "Updated test achievement description",
      points: 90
    };

    const updateResponse = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements/${newAchievement.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.json();
      console.error(`❌ Failed to update achievement: ${updateResponse.status}`);
      console.error('Error details:', error);
      return;
    }

    const updatedAchievement = await updateResponse.json();
    console.log(`✅ Achievement updated successfully - Points: ${updatedAchievement.points}\n`);

    // Test 4: Clean up - delete the test achievement
    console.log('4. Testing achievement deletion...');
    const deleteResponse = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements/${newAchievement.id}`, {
      method: 'DELETE'
    });

    if (!deleteResponse.ok) {
      const error = await deleteResponse.json();
      console.error(`❌ Failed to delete achievement: ${deleteResponse.status}`);
      console.error('Error details:', error);
      return;
    }

    console.log('✅ Achievement deleted successfully\n');

    console.log('🎉 All tests passed! The Inter-IIT achievements system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testInterIITAchievements().catch(console.error);
