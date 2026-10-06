#!/bin/sh
# Build the browser version with test stand-ins, serve it, and click through a workout.
set -e
cd "$(dirname "$0")/.."
OUT=${E2E_BUILD:-/tmp/fitfaaz-web}
cp package.json package.json.e2e-bak
node -e "const p=require('./package.json');p.main='e2e/entry.js';require('fs').writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')"
FITFAAZ_E2E=1 npx expo export --platform web --output-dir "$OUT" >/dev/null || { mv package.json.e2e-bak package.json; exit 1; }
mv package.json.e2e-bak package.json
node e2e/serve.js "$OUT" 8089 & SERVER=$!
sleep 1
node e2e/workout.e2e.js; STATUS=$?
kill $SERVER
exit $STATUS
