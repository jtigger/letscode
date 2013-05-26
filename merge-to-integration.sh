#/bin/bash
# merges in the current state on master into integration.
# run this only if the build is known good.

git checkout integration

# make the git history easier to read by marking when merges happen (and the content of those merges.
git merge master --no-ff --log

git checkout master
