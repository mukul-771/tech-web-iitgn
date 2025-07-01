// Test the team data by making an API call
async function testTeamMigration() {
  try {
    console.log('🧪 Testing team migration via API...');
    
    const response = await fetch('http://localhost:3000/api/team');
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Total members: ${data.length}`);
      
      // Category breakdown
      const categories = {};
      data.forEach(member => {
        categories[member.category] = (categories[member.category] || 0) + 1;
      });
      
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} members`);
      });
      
      // Show some member details
      console.log('\n📝 Sample members:');
      data.slice(0, 3).forEach(member => {
        console.log(`   - ${member.name} (${member.category}) - ${member.position}`);
      });
      
      console.log('\n🎉 Team migration test completed successfully!');
    } else {
      console.error('❌ API call failed:', data);
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTeamMigration();
