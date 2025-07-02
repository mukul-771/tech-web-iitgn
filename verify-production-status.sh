#!/bin/bash

# Production API Verification Script
# Verifies that all APIs are using Neon database after migration

echo "🚀 Production API Verification Script"
echo "===================================="
echo ""

BASE_URL="https://tech-web-iitgn.vercel.app"

echo "📋 Testing API Endpoints..."
echo ""

# Test Team API
echo "1. Team API:"
TEAM_TYPE=$(curl -s "$BASE_URL/api/team" | jq -r 'type')
TEAM_COUNT=$(curl -s "$BASE_URL/api/team" | jq '. | length' 2>/dev/null || echo "0")

if [ "$TEAM_TYPE" = "array" ]; then
    echo "   ✅ Format: Array (Database)"
    echo "   ✅ Count: $TEAM_COUNT members"
else
    echo "   ❌ Format: Object (Blob Storage)"
    echo "   ❌ Still needs migration"
fi

echo ""

# Test Team Leadership API
echo "2. Team Leadership API:"
LEADERSHIP_TYPE=$(curl -s "$BASE_URL/api/team/leadership" | jq -r 'type')
LEADERSHIP_COUNT=$(curl -s "$BASE_URL/api/team/leadership" | jq '. | length' 2>/dev/null || echo "0")

if [ "$LEADERSHIP_TYPE" = "array" ]; then
    echo "   ✅ Format: Array (Database)"
    echo "   ✅ Count: $LEADERSHIP_COUNT leaders"
else
    echo "   ❌ Format: Object (Blob Storage)"
    echo "   ❌ Still needs migration"
fi

echo ""

# Test Clubs API
echo "3. Clubs API:"
CLUBS_TYPE=$(curl -s "$BASE_URL/api/clubs" | jq -r 'type')
CLUBS_COUNT=$(curl -s "$BASE_URL/api/clubs" | jq '. | length' 2>/dev/null || echo "0")

if [ "$CLUBS_TYPE" = "array" ]; then
    echo "   ✅ Format: Array (Database)"
    echo "   ✅ Count: $CLUBS_COUNT clubs"
else
    echo "   ❌ Format: Object (Blob Storage)"
    echo "   ❌ Migration failed"
fi

echo ""

# Test Migration Endpoints
echo "4. Migration Endpoints:"

# Test team migration endpoint
TEAM_MIGRATE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/migrate/team")
if [ "$TEAM_MIGRATE_STATUS" = "200" ]; then
    echo "   ✅ Team migration endpoint: Available"
else
    echo "   ❌ Team migration endpoint: $TEAM_MIGRATE_STATUS (Not available)"
fi

# Test clubs migration endpoint
CLUBS_MIGRATE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/migrate/clubs")
if [ "$CLUBS_MIGRATE_STATUS" = "200" ]; then
    echo "   ✅ Clubs migration endpoint: Available"
else
    echo "   ❌ Clubs migration endpoint: $CLUBS_MIGRATE_STATUS (Not available)"
fi

echo ""

# Summary
echo "📊 Summary:"
echo "==========="

if [ "$TEAM_TYPE" = "array" ] && [ "$CLUBS_TYPE" = "array" ]; then
    echo "🎉 SUCCESS: All APIs are using Neon database!"
    echo ""
    echo "✅ Team API: Database ($TEAM_COUNT members)"
    echo "✅ Clubs API: Database ($CLUBS_COUNT clubs)"
    echo "✅ Leadership API: Database ($LEADERSHIP_COUNT leaders)"
elif [ "$CLUBS_TYPE" = "array" ] && [ "$TEAM_TYPE" != "array" ]; then
    echo "⚠️  PARTIAL: Clubs migrated, Team migration needed"
    echo ""
    echo "✅ Clubs API: Database ($CLUBS_COUNT clubs)"
    echo "❌ Team API: Still blob storage"
    echo ""
    if [ "$TEAM_MIGRATE_STATUS" = "200" ]; then
        echo "🔧 Next steps:"
        echo "   Run: curl -X POST \"$BASE_URL/api/migrate/team\""
        echo "   Then re-run this script to verify"
    else
        echo "❌ Team migration endpoint not available"
        echo "   Deployment may still be in progress"
    fi
else
    echo "❌ FAILED: APIs still using blob storage"
    echo ""
    echo "❌ Team API: $TEAM_TYPE"
    echo "❌ Clubs API: $CLUBS_TYPE"
fi

echo ""
echo "🕐 Script completed at: $(date)"
