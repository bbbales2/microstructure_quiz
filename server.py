import gensim
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

login_manager = flask.ext.login.LoginManager()
session = flask.ext.session.Session()

appDir = os.path.abspath(os.path.dirname(__file__))

templateLoader = jinja2.FileSystemLoader(searchpath = "templates")
templateEnv = jinja2.Environment(loader = templateLoader)

engine = database.getEngine(os.path.join(appDir, 'db.sql'))

def logexceptions(func):
    def inner(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            traceback.print_exc()

            return { 'status' : False, 'msg' : str(e) }

    return inner

app = flask.Flask('digibookie')
app.config.from_object({ 'DEBUG' : True,
                         'SECRET_KEY' : 'something' })

login_manager.login_view = '/login'

@login_manager.user_loader
def load_user(user_id):
    return flask.g.session.query(database.User).get(user_id)

@app.before_request
def before_request():
    flask.g.session = database.getSession(engine)

@app.teardown_request
def teardown_request(exception):
    session = getattr(flask.g, 'session', None)
    if session is not None:
        session.commit()
        session.close()

@app.route('/login', methods=['GET', 'POST'])
def login():
    username = flask.request.form.get('username', None)
    password = flask.request.form.get('password', None)

    if username:
        user = flask.g.session.query(database.User).filter(database.User.name == username).first()
        
        if user:
            if user.password != password:
                return flask.render_template('login.html', msg = msg)            

            flask.ext.login.login_user(user)

            flask.flash('Logged in successfully.')
            
            return flask.redirect('/')

    return flask.render_template('login.html')

@app.route('/create_user', methods=['GET', 'POST'])
def create_user():
    username = flask.request.form.get('username', None)
    password = flask.request.form.get('password', None)

    if username:
        user = flask.g.session.query(database.User).filter(database.User.name == username).first()

        if not user:
            user = database.User(name = username, password = password)
            flask.g.session.add(user)
            flask.g.session.commit()

        flask.ext.login.login_user(user)

        flask.flash('User created and logged in successfully.')

        return flask.redirect('/')

    return flask.render_template('create_user.html')

@app.route('/logout', methods=['GET', 'POST'])
@flask.ext.login.login_required
def logout():
    flask.ext.login.logout_user()
    return flask.redirect('/login')

@app.route('/make_bet', methods=['POST'])
@flask.ext.login.login_required
def takeBet():
    gameId = int(flask.request.form.get('gameId', None))
    line = float(flask.request.form.get('line', None))
    choice = flask.request.form.get('choice', None)

    if choice not in ['home', 'away']:
        return flask.json.jsonify({ 'status' : False, 'msg' : "Error parsing request" })

    game = flask.g.session.query(database.Game).get(gameId)

    if not game or line not in game.lines or datetime.datetime.utcnow() > game.date:
        return flask.json.jsonify({ 'status' : False, 'msg' : 'Game/Line combo not available for betting' })

    bet = flask.g.session.query(database.Bet).filter(sqlalchemy.and_(
        database.Bet.userId == flask.ext.login.current_user.get_id(),
        database.Bet.gameId == gameId)
    ).first()

    if bet is not None:
        return flask.json.jsonify({ 'status' : False, 'msg' : 'You only get one bet per game' })

    flask.g.session.add(database.Bet(userId = flask.ext.login.current_user.get_id(), gameId = gameId, line = line, result = -1, date = game.date, choice = choice))

    return flask.json.jsonify({ 'status' : True, 'msg' : 'Bet accepted' })

@app.route('/log')
@flask.ext.login.login_required
def betLog():
    date = datetime.datetime.utcnow()
    date = datetime.datetime(year = date.year, month = date.month, day = date.day)

    bets = flask.g.session.query(database.Bet).filter(sqlalchemy.and_(
        userId == flask.ext.login.current_user.get_id(),
        database.Bet.date > date)
    ).all()

    return flask.render_template('index.html', bets, games = [])

@app.route('/')
@flask.ext.login.login_required
def index():
    date = datetime.datetime.utcnow()
    date = datetime.datetime(year = date.year, month = date.month, day = date.day)

    bets = []

    for bet in flask.g.session.query(database.Bet).filter(sqlalchemy.and_(
        database.Bet.userId == flask.ext.login.current_user.get_id(),
        database.Bet.date > date)
    ).order_by(sqlalchemy.desc(database.Bet.date)):
        bets.append({ "line" : bet.line,
                      "title" : "{0} at {1}".format(bet.game.away, bet.game.home),
                      "gameId" : bet.gameId,
                      "choice" : bet.choice })

    games = []

    for game in flask.g.session.query(database.Game).filter(database.Game.date > date).order_by(sqlalchemy.desc(database.Game.date)):
        games.append({ "home" : game.home,
                       "away" : game.away,
                       "line" : game.lines[-1],
                       "id" : game.id,
                       "date" : date.strftime("%a, %b %d, %H:%M GMT") })

    print bets, games

    return flask.render_template('index.html', username = flask.ext.login.current_user.name, data = json.dumps({ 'bets' : bets, 'games' : games }))

#@app.route('/secret-page')
#@requires_auth
#def secret_page():
#    return "yabadabbado!"

if __name__ == '__main__':
    app.secret_key = 'alsdkjfasd'
    app.config['SESSION_TYPE'] = 'filesystem'

    login_manager.init_app(app)
    session.init_app(app)

    app.run(debug = True)
