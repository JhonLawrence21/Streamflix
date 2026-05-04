#!/bin/bash
set -e
echo "=== Build started at $(pwd) ==="

echo "=== Installing dependencies ==="
npm install
cd client
npm install
cd ..

echo "=== Building client ==="
cd client
npm run build
cd ..

echo "=== Verifying build output ==="
pwd
ls -la client/build/ || (echo "ERROR: client/build not found!" && exit 1)
ls -la client/build/index.html || (echo "ERROR: index.html not found!" && exit 1)

echo "=== Build completed successfully ==="
echo "Build files:"
find client/build -name "*.html" -o -name "*.js" -o -name "*.css" | head -20
