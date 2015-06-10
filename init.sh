#!/bin/bash

# Fail on an error
set -e

echo "== Installing Ruby Gems (bundle install) =="
bundle install
echo "== Ruby Gems Installed =="

echo "== Installing NPM Packages (npm install) =="
npm install
echo "== NPM Packages Installed =="

echo "== Installing Bower Packages (./node_modules/.bin/bower install) =="
./node_modules/.bin/bower install
echo "== Bower Packages Installed =="

echo " * You should be good to go, try running './node_modules/.bin/gulp'"
