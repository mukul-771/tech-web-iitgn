// Test script to debug event deletion
// Run this in the browser console when logged into the admin panel

async function testEventDeletion() {
  try {
    console.log('Testing event deletion...');
    
    // First, get all events
    const eventsResponse = await fetch('/api/admin/events');
    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
    }
    
    const eventsData = await eventsResponse.json();
    console.log('Current events:', eventsData);
    
    if (!eventsData.events || Object.keys(eventsData.events).length === 0) {
      console.log('No events to delete');
      return;
    }
    
    // Get the first event ID
    const eventId = Object.keys(eventsData.events)[0];
    console.log('Attempting to delete event:', eventId);
    
    // Test delete
    const deleteResponse = await fetch(`/api/admin/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Delete response status:', deleteResponse.status);
    console.log('Delete response headers:', Object.fromEntries(deleteResponse.headers.entries()));
    
    const deleteResult = await deleteResponse.text();
    console.log('Delete response body:', deleteResult);
    
    if (!deleteResponse.ok) {
      throw new Error(`Delete failed with status: ${deleteResponse.status}`);
    }
    
    // Verify deletion
    const verifyResponse = await fetch('/api/admin/events');
    const verifyData = await verifyResponse.json();
    console.log('Events after deletion:', verifyData);
    
    console.log('Delete test completed successfully!');
    
  } catch (error) {
    console.error('Delete test failed:', error);
  }
}

// Run the test
testEventDeletion();
