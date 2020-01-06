#!/usr/bin/env sh

# abort on errors
set -e

# build
npm run build

# navigate to build dir
cd dist

# deploy on GH pages
git init
git add -A
git commit -m 'deploy'
git push -f git@github.com:FurySim/furysim.github.io.git master

# back to root
cd -

# push tags (releases)
git push --tags
