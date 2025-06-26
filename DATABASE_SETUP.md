# Database Setup Guide

This project now uses **Neon (Serverless Postgres)** for storing achievements and events data instead of blob storage.

## 1. Create a Neon Database

1. Go to [Neon](https://neon.tech) and create a free account
2. Create a new project/database
3. Copy the connection string (it will look like: `postgresql://username:password@ep-xxx.neon.tech/dbname?sslmode=require`)

## 2. Add Database URL to Environment Variables

Add the following to your `.env.local` file:

```bash
# Database
DATABASE_URL="your-neon-connection-string-here"
```

## 3. Generate and Run Migrations

```bash
# Generate migration files
npm run db:generate

# Apply migrations to create tables
npm run db:push
```

## 4. Migrate Existing Data

After setting up the database, you can migrate your existing blob storage data:

1. Navigate to: `http://localhost:3000/api/admin/migrate-data`
2. Or run the migration from the admin panel (we'll add this feature)

## 5. Optional: Database Studio

To view and manage your database visually:

```bash
npm run db:studio
```

This will open Drizzle Studio in your browser where you can see your tables and data.

## Commands Reference

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Apply migrations
- `npm run db:push` - Push schema directly (for development)
- `npm run db:studio` - Open Drizzle Studio

## Benefits of Database Storage

1. **Real-time updates** - No more caching issues
2. **Better data consistency** - ACID transactions
3. **Advanced querying** - Filter, sort, search efficiently
4. **Relationships** - Can add foreign keys in the future
5. **Scalability** - Much better performance for large datasets
6. **Type safety** - Full TypeScript support with Drizzle ORM

## Fallback

If you want to keep using blob storage temporarily, the old blob storage functions are still available. The system will automatically detect and use the database when `DATABASE_URL` is provided.
