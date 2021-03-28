#!/usr/bin/env bash

rm -rf node_modules/

rm package-lock.json

rm yarn-lock.json

rm -rf certificates/

yarn cache clean

yarn

yarn check

gulp publish
