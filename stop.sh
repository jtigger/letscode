#bin/bash

ps | grep node | head -1
kill `ps | grep "node" | awk '{ print $1 }' | head -1`
