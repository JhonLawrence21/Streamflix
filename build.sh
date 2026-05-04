#!/bin/bash
set -e
echo "=== Build started at $(pwd) ==="
pwd
ls -la

echo "=== Step 1: Install root dependencies ==="
npm install
echo "Root install completed"

echo "=== Step 2: Build client ==="
cd client
echo "In client directory: $(pwd)"
npm install
echo "Client install completed"
npm run build
echo "Client build completed"
echo "Build output:"
ls -la build/
cat build/index.html | head -5
cd ..

echo "=== Step 3: Verify build output ==="
ls -la client/build/ || (echo "ERROR: client/build not found!" && exit 1)
ls -la client/build/index.html || (echo "ERROR: index.html not found!" && exit 1)
echo "=== Build completed successfully ==="
