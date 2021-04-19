#!/bin/sh

# React
npx react-scripts build > /dev/null

mv ./build ./react

mkdir -p ./build

mv ./react ./build/public

# Express
npx tsc --project ./api/tsconfig.json --outDir ./build
