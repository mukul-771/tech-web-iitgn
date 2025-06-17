import { NextRequest, NextResponse } from 'next/server';
import { getAllInterIITAchievements, createInterIITAchievement } from '@/lib/inter-iit-achievements-storage';

export async function GET() {
  try {
    const achievements = await getAllInterIITAchievements();
    const achievementsArray = Object.values(achievements).sort((a, b) =>
      new Date(b.achievementDate).getTime() - new Date(a.achievementDate).getTime()
    );
    return NextResponse.json(achievementsArray);
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
      ...body,
      supportingDocuments: body.supportingDocuments || [],
      points: body.points || null,
      ranking: body.ranking || null
    };

    const newAchievement = await createInterIITAchievement(achievementData);
    return NextResponse.json(newAchievement, { status: 201 });
  } catch (error) {
    console.error('Error creating Inter-IIT achievement:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Inter-IIT achievement' },
      { status: 500 }
    );
  }
}


