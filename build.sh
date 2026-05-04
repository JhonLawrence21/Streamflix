#!/bin/bash
set -e
echo "=== Starting build ==="
npm install
cd client
npm install
npm run build
cd ..
echo "=== Build completed ==="
echo "Checking build output:"
ls -la client/build/
echo "=== index.html exists? ==="
test -f client/build/index.html && echo "YES" || echo "NO"
