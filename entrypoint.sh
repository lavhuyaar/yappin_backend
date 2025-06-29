#!/bin/sh

echo "🐘 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting server..."
node dist/server.js