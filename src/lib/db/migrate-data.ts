import { getAllInterIITAchievements as getBlobAchievements } from '@/lib/inter-iit-achievements-blob-storage';
import { getAllEvents as getBlobEvents } from '@/lib/events-blob-storage';
import { createInterIITAchievement } from '@/lib/db/achievements';
import { createEvent } from '@/lib/db/events';

export async function migrateAchievementsToDatabase() {
  try {
    console.log('Starting Inter-IIT achievements migration...');
    
    // Get achievements from blob storage
    const blobAchievements = await getBlobAchievements();
    const achievementsArray = Object.values(blobAchievements);
    
    console.log(`Found ${achievementsArray.length} achievements to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const achievement of achievementsArray) {
      try {
        // Remove the id from the achievement object for creation and fix types
        const achievementData = {
          achievementType: achievement.achievementType,
          competitionName: achievement.competitionName,
          interIITEdition: achievement.interIITEdition,
          year: achievement.year,
          hostIIT: achievement.hostIIT,
          location: achievement.location,
          ranking: achievement.ranking,
          achievementDescription: achievement.achievementDescription,
          significance: achievement.significance,
          competitionCategory: achievement.competitionCategory,
          achievementDate: achievement.achievementDate,
          points: achievement.points,
          status: achievement.status,
          teamMembers: achievement.teamMembers.map(member => ({
            ...member,
            achievements: member.achievements || []
          })),
          supportingDocuments: achievement.supportingDocuments?.map(doc => ({
            ...doc,
            description: doc.description || ''
          })) || []
        };
        
        await createInterIITAchievement(achievementData);
        migrated++;
        console.log(`Migrated: ${achievement.competitionName}`);
      } catch (error) {
        console.warn(`Skipped ${achievement.competitionName} (might already exist):`, error instanceof Error ? error.message : error);
        skipped++;
      }
    }
    
    console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped`);
    return { migrated, skipped, total: achievementsArray.length };
  } catch (error) {
    console.error('Error migrating achievements:', error);
    throw error;
  }
}

export async function migrateEventsToDatabase() {
  try {
    console.log('Starting events migration...');
    
    // Get events from blob storage
    const blobEvents = await getBlobEvents();
    const eventsArray = Object.values(blobEvents);
    
    console.log(`Found ${eventsArray.length} events to migrate`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const event of eventsArray) {
      try {
        // Create event data object for the new schema
        const eventData = {
          title: event.title,
          description: event.description,
          date: event.date,
          location: event.location,
          duration: event.duration,
          participants: event.participants,
          organizer: event.organizer,
          category: event.category,
          highlights: event.highlights || [],
          gallery: event.gallery || [],
          draft: false // All existing events are considered published
        };
        
        await createEvent(eventData);
        migrated++;
        console.log(`Migrated: ${event.title}`);
      } catch (error) {
        console.warn(`Skipped ${event.title} (might already exist):`, error instanceof Error ? error.message : error);
        skipped++;
      }
    }
    
    console.log(`Migration complete: ${migrated} migrated, ${skipped} skipped`);
    return { migrated, skipped, total: eventsArray.length };
  } catch (error) {
    console.error('Error migrating events:', error);
    throw error;
  }
}

// Migration API endpoint functionality
export async function runMigration() {
  const achievementsResult = await migrateAchievementsToDatabase();
  const eventsResult = await migrateEventsToDatabase();
  
  return {
    achievements: achievementsResult,
    events: eventsResult
  };
}
