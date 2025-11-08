#!/bin/bash

echo "🔧 Regenerating package-lock.json for Railway deployment..."
echo ""

# Remove old lockfile
echo "Step 1: Removing old package-lock.json..."
rm -f package-lock.json
echo "✓ Old lockfile removed"
echo ""

# Generate fresh lockfile
echo "Step 2: Generating fresh package-lock.json..."
npm install --package-lock-only --legacy-peer-deps
echo "✓ Fresh lockfile generated"
echo ""

echo "🎉 Done! Now commit and push package-lock.json"
echo ""
echo "Run these commands:"
echo "  git add package-lock.json"
echo "  git commit -m 'Fix: Regenerate package-lock.json for Railway deployment'"
echo "  git push origin master"

