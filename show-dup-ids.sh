#/bin/bash
find . -name "*.js" -print0 | xargs -0 egrep --only-matching --no-filename "CAP-.*" | sort --reverse | uniq -c
