#!/bin/sh

# React
npx react-scripts build

mv ./build ./react

mkdir -p ./build

mv ./react ./build/public

# Express
npx tsc --project ./api/tsconfig.json --outDir ./build

cp -r ./api/sql ./build/api/sql
