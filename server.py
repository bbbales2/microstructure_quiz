import jinja2
import json
import numpy
import traceback
import os
import sqlalchemy.orm
import itertools
import md5
import database
import datetime

import functools
import flask
import flask.ext.login
import flask.ext.session

appDir = os.path.abspath(os.path.dirname(__file__))

templateLoader = jinja2.FileSystemLoader(searchpath = "templates")
templateEnv = jinja2.Environment(loader = templateLoader)

session = flask.ext.session.Session()

engine = database.getEngine(os.path.join(appDir, 'db.sql'))

def logexceptions(func):
    def inner(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            traceback.print_exc()

            return { 'status' : False, 'msg' : str(e) }

    return inner

app = flask.Flask('microstructure_quiz')

@app.before_request
def before_request():
    flask.g.session = database.getSession(engine)

@app.teardown_request
def teardown_request(exception):
    session = getattr(flask.g, 'session', None)
    if session is not None:
        session.commit()
        session.close()

@app.route('/accept_score', methods=['POST'])
def accept_score():
    data = flask.request.form.get('variables', None)
    samples = flask.request.form.get('samples', None)

    print data

    data = json.loads(data)
    samples = json.loads(samples)

    print data

    date = datetime.datetime.utcnow()
    date = datetime.datetime(year = date.year, month = date.month, day = date.day)

    print date

    flask.g.session.add(database.Quiz(date = date, name = data['name'], answers = json.dumps(data['answers']), correct = data['correct'], total = data['total'], samples = json.dumps(samples)))

    return flask.json.jsonify({ 'status' : True, 'msg' : 'Score accepted' })

@app.route('/scores')
def scores():
    quizes = flask.g.session.query(database.Quiz)

    return flask.render_template('scores.html', quizes = quizes)

@app.route('/')
def index():
    pw = flask.request.args.get('pw', None)

    print pw

    if pw != 'microstructures':
        return ''

    return flask.render_template('start.html')

@app.route('/quiz')
def quiz():
    pw = flask.request.args.get('pw', None)

    print pw

    if pw != 'microstructures':
        return ''

    return flask.render_template('index.html')

if __name__ == '__main__':
    app.secret_key = 'alsdkjfasd'
    app.config['SESSION_TYPE'] = 'filesystem'

    session.init_app(app)

    app.run(host = 'basilisk.cs.ucsb.edu', debug = False)
