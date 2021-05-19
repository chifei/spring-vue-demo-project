#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd $DIR

sudo supervisorctl stop demo4
rm -fR $DIR/demo-website
unzip $DIR/demo-website
sudo supervisorctl start demo4


