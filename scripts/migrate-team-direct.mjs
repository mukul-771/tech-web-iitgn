#!/usr/bin/env node

/**
 * Direct Team Migration: data/team.json → Neon Database
 * This script directly migrates team data from the local JSON file to Neon database
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// We'll use direct database connection since the TypeScript imports are complex
async function migrateTeamDataDirect() {
  try {
    console.log('🚀 Direct Team Data Migration: JSON → Neon Database\n');
    
    // Step 1: Read team data from local file
    console.log('📁 Reading team data from local file...');
    const teamFilePath = join(process.cwd(), 'data', 'team.json');
    let teamData;
    
    try {
      teamData = JSON.parse(readFileSync(teamFilePath, 'utf-8'));
    } catch (error) {
      console.error('❌ Failed to read team.json:', error);
      process.exit(1);
    }
    
    const teamMembers = Object.values(teamData);
    console.log(`   Found ${teamMembers.length} team members in JSON data`);
    
    if (teamMembers.length === 0) {
      console.log('⚠️  No team members found in JSON data');
      return;
    }
    
    // Step 2: Show sample data
    console.log('\n📋 Sample team member data:');
    const sample = teamMembers[0];
    console.log('   ID:', sample.id);
    console.log('   Name:', sample.name);
    console.log('   Position:', sample.position);
    console.log('   Email:', sample.email);
    console.log('   Category:', sample.category);
    console.log('   Is Secretary:', sample.isSecretary);
    console.log('   Is Coordinator:', sample.isCoordinator);
    
    // Step 3: Generate SQL INSERT statements
    console.log('\n🔄 Generating SQL INSERT statements...');
    
    const insertStatements = teamMembers.map(member => {
      const values = [
        `'${member.id}'`,
        `'${member.name.replace(/'/g, "''")}'`, // Escape single quotes
        `'${member.position.replace(/'/g, "''")}'`,
        `'${member.email}'`,
        `'${member.initials}'`,
        `'${member.gradientFrom}'`,
        `'${member.gradientTo}'`,
        `'${member.category}'`,
        member.photoPath ? `'${member.photoPath}'` : 'NULL',
        member.isSecretary ? 'true' : 'false',
        member.isCoordinator ? 'true' : 'false',
        'NOW()',
        'NOW()'
      ];
      
      return `INSERT INTO team_members (id, name, position, email, initials, gradient_from, gradient_to, category, photo_path, is_secretary, is_coordinator, created_at, updated_at) VALUES (${values.join(', ')});`;
    });
    
    console.log(`   Generated ${insertStatements.length} INSERT statements`);
    
    // Step 4: Create SQL file
    const sqlContent = [
      '-- Team Data Migration: JSON to Neon Database',
      '-- Generated on: ' + new Date().toISOString(),
      '-- Total records: ' + teamMembers.length,
      '',
      '-- Clear existing data (uncomment if needed)',
      '-- DELETE FROM team_members;',
      '',
      '-- Insert team members',
      ...insertStatements,
      '',
      '-- Verify migration',
      'SELECT COUNT(*) as total_members FROM team_members;',
      'SELECT category, COUNT(*) as count FROM team_members GROUP BY category;'
    ].join('\\n');
    
    const sqlFilePath = join(process.cwd(), 'team-migration.sql');
    
    try {
      const fs = await import('fs/promises');
      await fs.writeFile(sqlFilePath, sqlContent);
      console.log(`   ✅ SQL file created: ${sqlFilePath}`);
    } catch (error) {
      console.error('❌ Failed to write SQL file:', error);
    }
    
    // Step 5: Show manual execution instructions
    console.log('\n📝 Manual Migration Instructions:');
    console.log('1. Copy the SQL from the generated file');
    console.log('2. Go to your Neon Dashboard: https://console.neon.tech/');
    console.log('3. Open the SQL Editor for your database');
    console.log('4. Paste and execute the SQL statements');
    console.log('');
    console.log('Or execute directly with psql:');
    console.log(`psql "${process.env.DATABASE_URL}" -f team-migration.sql`);
    
    // Step 6: Show categories breakdown
    console.log('\n📊 Team Members by Category:');
    const categoryCount = {};
    teamMembers.forEach(member => {
      categoryCount[member.category] = (categoryCount[member.category] || 0) + 1;
    });
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} members`);
    });
    
    // Step 7: Show leadership roles
    const secretaries = teamMembers.filter(m => m.isSecretary);
    const coordinators = teamMembers.filter(m => m.isCoordinator);
    
    console.log('\\n👥 Leadership Roles:');
    console.log(`   Secretaries: ${secretaries.length}`);
    secretaries.forEach(s => console.log(`      - ${s.name} (${s.position})`));
    console.log(`   Coordinators: ${coordinators.length}`);
    coordinators.forEach(c => console.log(`      - ${c.name} (${c.position})`));
    
    console.log('\\n🎉 Migration preparation completed!');
    console.log('Execute the generated SQL to complete the migration.');
    
  } catch (error) {
    console.error('\\n💥 Migration preparation failed:', error);
    process.exit(1);
  }
}

// Run migration preparation
console.log('🔧 Team Data Migration Tool (Direct SQL)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

migrateTeamDataDirect();
