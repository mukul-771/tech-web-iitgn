// Debug script to test frontend form submission
// This script simulates form data exactly as it would be sent from the frontend

const BASE_URL = 'http://localhost:3000';

async function testFormSubmission() {
  console.log('🧪 Testing Frontend Form Submission\n');

  // Simulate exact form data that would be sent from the frontend
  const formData = {
    achievementType: "gold-medal",
    competitionName: "Programming Contest",
    interIITEdition: "Inter-IIT Tech Meet 13.0", 
    year: "2024",
    hostIIT: "IIT Delhi",
    location: "New Delhi",
    ranking: 1,
    achievementDescription: "Won first place in the programming contest with outstanding performance",
    significance: "This gold medal demonstrates our strong programming capabilities",
    competitionCategory: "Programming",
    achievementDate: "2024-06-25",
    points: 100,
    status: "verified",
    teamMembers: [
      {
        name: "John Doe",
        rollNumber: "21110001",
        branch: "Computer Science and Engineering",
        year: "3rd Year",
        role: "Team Lead",
        email: "john.doe@iitgn.ac.in",
        phone: "",
        achievements: ["Programming Contest Gold Medal"]
      },
      {
        name: "Jane Smith", 
        rollNumber: "21110002",
        branch: "Computer Science and Engineering",
        year: "3rd Year",
        role: "Member",
        email: "jane.smith@iitgn.ac.in",
        phone: "",
        achievements: ["Programming Contest Gold Medal"]
      }
    ],
    supportingDocuments: []
  };

  try {
    console.log('Sending form data to API...');
    console.log('Data:', JSON.stringify(formData, null, 2));
    
    const response = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Form submission failed');
      console.error('Error details:', errorData);
      
      // Check for specific validation errors
      if (errorData.error) {
        console.error('Specific error:', errorData.error);
      }
      return;
    }

    const result = await response.json();
    console.log('✅ Form submission successful!');
    console.log('Created achievement:', result);

    // Clean up - delete the test achievement
    const deleteResponse = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements/${result.id}`, {
      method: 'DELETE'
    });

    if (deleteResponse.ok) {
      console.log('✅ Test achievement cleaned up successfully');
    }

  } catch (error) {
    console.error('❌ Network or parsing error:', error.message);
    console.error('Full error:', error);
  }
}

// Test updating an existing achievement
async function testUpdateSubmission() {
  console.log('\n🔄 Testing Update Submission\n');

  try {
    // First get existing achievements
    const listResponse = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements`);
    if (!listResponse.ok) {
      console.error('❌ Could not fetch existing achievements');
      return;
    }

    const achievements = await listResponse.json();
    if (achievements.length === 0) {
      console.log('ℹ️  No existing achievements to test update');
      return;
    }

    const testAchievement = achievements[0];
    console.log(`Testing update for achievement: ${testAchievement.id}`);

    // Prepare updated data
    const updateData = {
      ...testAchievement,
      achievementDescription: `Updated description - ${new Date().toISOString()}`,
      points: (testAchievement.points || 0) + 1
    };

    const updateResponse = await fetch(`${BASE_URL}/api/admin/inter-iit-achievements/${testAchievement.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    console.log(`Update response status: ${updateResponse.status} ${updateResponse.statusText}`);

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error('❌ Update failed');
      console.error('Error details:', errorData);
      return;
    }

    const result = await updateResponse.json();
    console.log('✅ Update successful!');
    console.log('Updated achievement points:', result.points);

  } catch (error) {
    console.error('❌ Update test failed:', error.message);
  }
}

// Run both tests
async function runAllTests() {
  await testFormSubmission();
  await testUpdateSubmission();
  console.log('\n🏁 All tests completed');
}

runAllTests().catch(console.error);
