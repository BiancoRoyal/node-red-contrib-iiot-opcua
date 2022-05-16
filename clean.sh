#!/usr/bin/env bash

rm -rf node_modules/

rm package-lock.json

rm -rf certificates/

rm node-red.docker

npm cache verify

npm i

gulp publish
