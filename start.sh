#! /bin/bash

export FLASK_APP="data-processing/backend"
flask run & ./node_modules/.bin/http-server -a localhost -p 8000 ./src && kill $!