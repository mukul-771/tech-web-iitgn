import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getAllInterIITAchievements, 
  createInterIITAchievement 
} from '@/lib/db/achievements';

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

export async function GET() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await getAllInterIITAchievements();
    
    // Sort by achievement date (most recent first)
    const sortedAchievements = achievements.sort((a, b) =>
      new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime()
    );
    
    return NextResponse.json(sortedAchievements, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching Inter-IIT achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Inter-IIT achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      'achievementType', 'competitionName', 'interIITEdition', 'year',
      'hostIIT', 'location', 'achievementDescription', 'significance',
      'competitionCategory', 'achievementDate', 'status'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate team members
    if (!body.teamMembers || !Array.isArray(body.teamMembers) || body.teamMembers.length === 0) {
      return NextResponse.json(
        { error: 'At least one team member is required' },
        { status: 400 }
      );
    }

    // Validate each team member
    for (const member of body.teamMembers) {
      const memberRequiredFields = ['name', 'rollNumber', 'branch', 'year', 'role', 'email'];
      for (const field of memberRequiredFields) {
        if (!member[field]) {
          return NextResponse.json(
            { error: `Team member ${field} is required` },
            { status: 400 }
          );
        }
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(member.email)) {
        return NextResponse.json(
          { error: `Invalid email format for team member: ${member.name}` },
          { status: 400 }
        );
      }
    }

    // Validate achievement type
    const validAchievementTypes = ['gold-medal', 'silver-medal', 'bronze-medal', 'ranking', 'special-award', 'recognition'];
    if (!validAchievementTypes.includes(body.achievementType)) {
      return NextResponse.json(
        { error: 'Invalid achievement type' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['verified', 'pending-verification', 'archived'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(body.achievementDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate ranking for non-medal achievements
    if (body.achievementType === 'ranking' && (!body.ranking || body.ranking < 1)) {
      return NextResponse.json(
        { error: 'Ranking is required for ranking achievements and must be greater than 0' },
        { status: 400 }
      );
    }

    // Set default values for optional fields
    const achievementData = {
      achievementType: body.achievementType,
      competitionName: body.competitionName,
      interIITEdition: body.interIITEdition,
      year: body.year,
      hostIIT: body.hostIIT,
      location: body.location,
      achievementDescription: body.achievementDescription,
      significance: body.significance,
      competitionCategory: body.competitionCategory,
      achievementDate: body.achievementDate,
      status: body.status,
      teamMembers: body.teamMembers.map((member: { name: string; rollNumber: string; branch: string; year: string; role: string; email: string; achievements?: string[] }) => ({
        ...member,
        achievements: member.achievements || []
      })),
      supportingDocuments: body.supportingDocuments?.map((doc: { name: string; type: string; filePath: string; uploadDate: string; description?: string }) => ({
        ...doc,
        description: doc.description || ''
      })) || [],
      points: body.points || null,
      ranking: body.ranking || null
    };

    const newAchievement = await createInterIITAchievement(achievementData);
    
    return NextResponse.json(newAchievement, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error creating Inter-IIT achievement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Inter-IIT achievement' },
      { status: 500 }
    );
  }
}


