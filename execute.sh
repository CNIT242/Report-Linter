#! /bin/bash
OUT=$(npx tsc --build --pretty);
printf "%s\n" "$OUT"

if [[ $OUT == "" ]]; then
    echo "build success. Initalizing nodejs:";
    node --env-file=.env dist/index.js;
fi
