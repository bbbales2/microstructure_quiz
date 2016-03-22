import sqlalchemy
import sqlalchemy.ext.declarative
import os

Base = sqlalchemy.ext.declarative.declarative_base()

class Quiz(Base):
    __tablename__ = 'quizes'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key = True)
    name = sqlalchemy.Column(sqlalchemy.String)
    date = sqlalchemy.Column(sqlalchemy.types.DateTime)
    correct = sqlalchemy.Column(sqlalchemy.Integer)
    total = sqlalchemy.Column(sqlalchemy.Integer)
    answers = sqlalchemy.Column(sqlalchemy.String)
    samples = sqlalchemy.Column(sqlalchemy.String)

def getEngine(path):
    engine = sqlalchemy.create_engine('sqlite:///{0}'.format(path), echo = False)

    Base.metadata.create_all(engine)

    return engine

def getSession(engine):
    Session = sqlalchemy.orm.sessionmaker()
    Session.configure(bind = engine)
    session = Session()

    return session
