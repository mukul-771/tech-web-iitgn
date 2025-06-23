// Test script to check team member update API
const testUpdateTeamMember = async () => {
  try {
    console.log('Testing team member update API...');
    
    // First, let's get the list of team members
    const getResponse = await fetch('http://localhost:3000/api/team');
    const teamData = await getResponse.json();
    
    console.log('Available team members:', Object.keys(teamData));
    
    // Pick the first team member for testing
    const firstMemberId = Object.keys(teamData)[0];
    const firstMember = teamData[firstMemberId];
    
    console.log('Testing update for member:', firstMemberId, firstMember);
    
    // Try to update the team member
    const updateData = {
      ...firstMember,
      position: `${firstMember.position} (Updated ${new Date().toLocaleTimeString()})`
    };
    
    const updateResponse = await fetch(`http://localhost:3000/api/admin/team/${firstMemberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    console.log('Update response status:', updateResponse.status);
    const result = await updateResponse.json();
    console.log('Update result:', result);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
testUpdateTeamMember();
