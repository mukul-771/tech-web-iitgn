import { NextResponse } from 'next/server';
import { updateHackathon, getHackathonById, getAllHackathons } from '@/lib/hackathons-storage';

export async function POST() {
  try {
    console.log('Testing update functionality...');
    
    // 1. Get current hackathons
    const hackathons = await getAllHackathons();
    console.log('Current hackathons:', Object.keys(hackathons));
    
    // 2. Try to update the first hackathon
    const firstHackathonId = Object.keys(hackathons)[0];
    if (!firstHackathonId) {
      return NextResponse.json({
        success: false,
        error: 'No hackathons found to update'
      });
    }
    
    console.log('Updating hackathon:', firstHackathonId);
    const originalHackathon = hackathons[firstHackathonId];
    console.log('Original description:', originalHackathon.description);
    
    // 3. Update the description
    const newDescription = `Updated at ${new Date().toISOString()}`;
    const updatedHackathon = await updateHackathon(firstHackathonId, {
      description: newDescription
    });
    
    console.log('Update result:', updatedHackathon);
    
    // 4. Fetch it back to verify
    const fetchedHackathon = await getHackathonById(firstHackathonId);
    console.log('Fetched after update:', fetchedHackathon);
    
    // 5. Get all hackathons to see the change
    const hackathonsAfterUpdate = await getAllHackathons();
    const hackathoAfterUpdate = hackathonsAfterUpdate[firstHackathonId];
    
    return NextResponse.json({
      success: true,
      message: 'Update test completed',
      results: {
        hackathonId: firstHackathonId,
        originalDescription: originalHackathon.description,
        newDescription: newDescription,
        updatedDescription: updatedHackathon.description,
        fetchedDescription: fetchedHackathon?.description,
        finalDescription: hackathoAfterUpdate?.description,
        allMatch: updatedHackathon.description === fetchedHackathon?.description && 
                 fetchedHackathon?.description === hackathoAfterUpdate?.description
      }
    });
    
  } catch (error) {
    console.error('Update test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
