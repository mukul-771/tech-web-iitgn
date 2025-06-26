import { NextResponse } from 'next/server';
import { runMigration } from '@/lib/db/migrate-data';

export async function GET() {
  try {
    console.log('🚀 Starting migration from blob storage to database...');
    
    const result = await runMigration();
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Results:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully!',
      results: result
    });
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
