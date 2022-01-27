#!/bin/sh

python3 -m venv .venv
. ./.venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Don't forget to save dependencies with (in venv)
# python3 -m pip freeze > requirements.txt
