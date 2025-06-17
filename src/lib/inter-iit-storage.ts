import { promises as fs } from 'fs';
import path from 'path';
import { InterIITEvent, defaultInterIITData } from './inter-iit-data';

const DATA_DIR = path.join(process.cwd(), 'data');
const INTER_IIT_FILE = path.join(DATA_DIR, 'inter-iit.json');

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Get all Inter-IIT events
export async function getAllInterIITEvents(): Promise<Record<string, InterIITEvent>> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(INTER_IIT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.log('Inter-IIT file not found, creating with default data');
    await saveAllInterIITEvents(defaultInterIITData);
    return defaultInterIITData;
  }
}

// Get Inter-IIT events for public display (array format)
export async function getInterIITEventsForDisplay(): Promise<InterIITEvent[]> {
  const events = await getAllInterIITEvents();
  return Object.values(events).sort((a, b) => 
    new Date(b.year).getTime() - new Date(a.year).getTime()
  );
}

// Get Inter-IIT event by ID
export async function getInterIITEventById(id: string): Promise<InterIITEvent | null> {
  const events = await getAllInterIITEvents();
  return events[id] || null;
}

// Save all Inter-IIT events with atomic write operation
export async function saveAllInterIITEvents(events: Record<string, InterIITEvent>): Promise<void> {
  try {
    await ensureDataDir();
    
    // Create temporary file for atomic write
    const tempFile = `${INTER_IIT_FILE}.tmp`;
    const data = JSON.stringify(events, null, 2);
    
    // Write to temporary file first
    await fs.writeFile(tempFile, data);
    
    // Atomically move temp file to final location
    await fs.rename(tempFile, INTER_IIT_FILE);
    
    console.log('Inter-IIT data saved successfully');
  } catch (error) {
    console.error('Error saving Inter-IIT events:', error);
    
    // Clean up temp file if it exists
    try {
      await fs.unlink(`${INTER_IIT_FILE}.tmp`);
    } catch {
      // Ignore cleanup errors
    }
    
    throw new Error('Failed to save Inter-IIT data');
  }
}

// Create new Inter-IIT event
export async function createInterIITEvent(event: Omit<InterIITEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<InterIITEvent> {
  const events = await getAllInterIITEvents();
  
  // Generate ID from name and year
  const id = `${event.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-')}-${event.year}`;
  
  // Ensure unique ID
  let uniqueId = id;
  let counter = 1;
  while (events[uniqueId]) {
    uniqueId = `${id}-${counter}`;
    counter++;
  }
  
  const now = new Date().toISOString();
  const newEvent: InterIITEvent = {
    ...event,
    id: uniqueId,
    createdAt: now,
    updatedAt: now,
  };
  
  events[uniqueId] = newEvent;
  await saveAllInterIITEvents(events);
  
  return newEvent;
}

// Update Inter-IIT event
export async function updateInterIITEvent(id: string, updates: Partial<Omit<InterIITEvent, 'id' | 'createdAt'>>): Promise<InterIITEvent> {
  const events = await getAllInterIITEvents();
  
  if (!events[id]) {
    throw new Error('Inter-IIT event not found');
  }
  
  const updatedEvent: InterIITEvent = {
    ...events[id],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  events[id] = updatedEvent;
  await saveAllInterIITEvents(events);
  
  return updatedEvent;
}

// Delete Inter-IIT event
export async function deleteInterIITEvent(id: string): Promise<void> {
  const events = await getAllInterIITEvents();
  
  if (!events[id]) {
    throw new Error('Inter-IIT event not found');
  }
  
  delete events[id];
  await saveAllInterIITEvents(events);
}

// Get events by year
export async function getInterIITEventsByYear(year: string): Promise<InterIITEvent[]> {
  const events = await getInterIITEventsForDisplay();
  return events.filter(event => event.year === year);
}

// Get latest Inter-IIT event
export async function getLatestInterIITEvent(): Promise<InterIITEvent | null> {
  const events = await getInterIITEventsForDisplay();
  return events.length > 0 ? events[0] : null;
}

// Search Inter-IIT events
export async function searchInterIITEvents(query: string): Promise<InterIITEvent[]> {
  const events = await getInterIITEventsForDisplay();
  const lowercaseQuery = query.toLowerCase();
  
  return events.filter(event => 
    event.name.toLowerCase().includes(lowercaseQuery) ||
    event.description.toLowerCase().includes(lowercaseQuery) ||
    event.hostIIT.toLowerCase().includes(lowercaseQuery) ||
    event.location.toLowerCase().includes(lowercaseQuery)
  );
}

// Get Inter-IIT statistics
export async function getInterIITStats(): Promise<{
  totalEvents: number;
  totalParticipations: number;
  totalMedals: number;
  goldMedals: number;
  silverMedals: number;
  bronzeMedals: number;
  bestPosition: number;
  averagePosition: number;
}> {
  const events = await getInterIITEventsForDisplay();
  
  let totalMedals = 0;
  let goldMedals = 0;
  let silverMedals = 0;
  let bronzeMedals = 0;
  let totalPosition = 0;
  let bestPosition = Infinity;
  
  events.forEach(event => {
    // Count medals from achievements
    event.achievements.forEach(achievement => {
      if (achievement.medal) {
        totalMedals++;
        if (achievement.medal === 'gold') goldMedals++;
        else if (achievement.medal === 'silver') silverMedals++;
        else if (achievement.medal === 'bronze') bronzeMedals++;
      }
    });
    
    // Find our position in overall results
    const ourResult = event.overallResults.find(result => result.iit === 'IIT Gandhinagar');
    if (ourResult) {
      totalPosition += ourResult.position;
      if (ourResult.position < bestPosition) {
        bestPosition = ourResult.position;
      }
    }
  });
  
  return {
    totalEvents: events.length,
    totalParticipations: events.reduce((sum, event) => sum + event.events.length, 0),
    totalMedals,
    goldMedals,
    silverMedals,
    bronzeMedals,
    bestPosition: bestPosition === Infinity ? 0 : bestPosition,
    averagePosition: events.length > 0 ? Math.round(totalPosition / events.length) : 0
  };
}

// Get team roster for a specific event
export async function getTeamRosterByEventId(eventId: string): Promise<InterIITEvent['teamRoster']> {
  const event = await getInterIITEventById(eventId);
  return event?.teamRoster || [];
}

// Get achievements for a specific event
export async function getAchievementsByEventId(eventId: string): Promise<InterIITEvent['achievements']> {
  const event = await getInterIITEventById(eventId);
  return event?.achievements || [];
}

// Get all years with Inter-IIT events
export async function getInterIITYears(): Promise<string[]> {
  const events = await getInterIITEventsForDisplay();
  const years = [...new Set(events.map(event => event.year))];
  return years.sort((a, b) => parseInt(b) - parseInt(a));
}
