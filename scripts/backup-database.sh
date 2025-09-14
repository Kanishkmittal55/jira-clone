#!/bin/bash

# Database Backup Script for Prisma/PostgreSQL
# Date: December 14, 2024

echo "================================================"
echo "Database Backup Script"
echo "================================================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL not found in .env file"
    exit 1
fi

# Parse DATABASE_URL
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
DB_URL=$DATABASE_URL
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "Creating database backup..."
echo "Database: $DB_NAME"
echo "Host: $DB_HOST"
echo "Backup file: $BACKUP_FILE"

# Create backup using pg_dump
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME > $BACKUP_FILE 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✓ Database backup created successfully"
    
    # Compress the backup
    gzip $BACKUP_FILE
    echo "✓ Backup compressed: ${BACKUP_FILE}.gz"
    
    # Generate Prisma schema backup
    echo "Backing up Prisma schema..."
    cp prisma/schema.prisma "${BACKUP_DIR}/schema_${TIMESTAMP}.prisma"
    echo "✓ Prisma schema backed up"
    
    # List recent backups
    echo ""
    echo "Recent backups:"
    ls -lh $BACKUP_DIR | tail -5
else
    echo "✗ Database backup failed"
    echo "Please check your DATABASE_URL and database connection"
    exit 1
fi

echo ""
echo "================================================"
echo "Backup Complete!"
echo "================================================"
echo ""
echo "To restore from this backup:"
echo "gunzip < ${BACKUP_FILE}.gz | PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
