#/bin/bash

clear

# designate a listening port for our app
export PORT=5000

# Make sure all dependencies are downloaded/installed
npm install

# build
node_modules/.bin/jake $*
