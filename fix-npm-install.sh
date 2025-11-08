#!/bin/bash

echo "🔧 Fixing npm installation issues..."
echo ""

# Step 1: Remove problematic node_modules
echo "Step 1: Removing node_modules and lock file..."
rm -rf node_modules package-lock.json
echo "✓ Cleanup complete"
echo ""

# Step 2: Clear npm cache
echo "Step 2: Clearing npm cache..."
npm cache clean --force
echo "✓ Cache cleared"
echo ""

# Step 3: Install dependencies with legacy peer deps
echo "Step 3: Installing dependencies (this may take a few minutes)..."
npm install --legacy-peer-deps
echo "✓ Dependencies installed"
echo ""

# Step 4: Install framer-motion specifically
echo "Step 4: Installing framer-motion..."
npm install framer-motion --legacy-peer-deps
echo "✓ framer-motion installed"
echo ""

echo "🎉 Installation complete!"
echo ""
echo "You can now run: npm run dev"

