#/bin/bash
#WEB_ROOT=src/spikes/004-how-ios-touch-events-work/web
WEB_ROOT=src/code/web

ln -s /Users/john/development/projects/jtigger/javascript/letscode/lib ${WEB_ROOT}/scripts/lib
node src/code/server/weewikipaint.js 5000 ${WEB_ROOT}
rm ${WEB_ROOT}/scripts/lib
