#! /bin/bash
npx tsc --build;
echo "build success. Initalizing nodejs:";
node --env-file=.env dist/index.js;
