#/bin/bash
ln -s /Users/john/development/projects/jtigger/javascript/letscode/lib src/code/web/scripts/lib
node src/code/server/weewikipaint.js 5000 src/code/web
rm src/code/web/scripts/lib
