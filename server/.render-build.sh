#!/usr/bin/env bash
# Render build script

echo "Installing all dependencies..."
npm install --include=dev

echo "Building TypeScript..."
npm run build
