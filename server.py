from flask import Flask, send_file, send_from_directory
from data_processing.dataPreparation import lastDataDep, dataDepAtDate

app = Flask(__name__, static_url_path='', static_folder="public")

@app.route('/')
def index():
    return send_file("public/index.html")

@app.route('/<path:path>')
def serve(path):
    print(path)
    return send_from_directory('public', path)

@app.route("/api")
def hello_world():
    return "<p>Hello, World!</p>"

@app.route("/lastDataDep")
def getDataDepToday():
    return lastDataDep()

#date format "dd-mm-yyyy"
@app.route("/dataDepDate/<string:date>")
def getDataDepAtDate(date):
    return dataDepAtDate(date)