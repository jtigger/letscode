#/bin/bash
WEB=src/spikes/003-how-to-manipulate-paths-with-raphael/web
#WEB=src/code/web

ln -s /Users/john/development/projects/jtigger/javascript/letscode/lib src/code/web/scripts/lib
node src/code/server/weewikipaint.js 5000 $WEB
rm src/code/web/scripts/lib
