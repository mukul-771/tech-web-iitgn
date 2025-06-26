import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    const result = await db.execute('SELECT NOW() as current_time');
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      timestamp: result.rows[0],
      database: 'Neon PostgreSQL'
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
