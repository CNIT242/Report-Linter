#! /bin/bash
npx tsc --build;
echo "build success. Initalizing nodejs:";
node dist/index.js --env-file=.env;
