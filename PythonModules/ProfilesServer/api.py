# -*- coding: utf-8 -*-
"""
Created on Tue Jul 28 14:51:23 2020

@author: NixsM
"""

from flask import Flask, Response, request
from flask_restful import Api, Resource
from flask_cors import CORS
import jwt
import base64
import json
from mongo_queries import findUserById, findClasses, setUserClasses, findChatProfiles


app = Flask(__name__)
cors = CORS(app)
app.config.from_object('config')


def verifyToken(token, public_key):
    token = base64.b64decode(token.encode('ascii'))
    print(token)
    try:
        data = jwt.decode(token, public_key, algorithms='RS256')
        return data
    except Exception as e:
        print(e)
        raise e
    
def createResponse(data, status_code):
    try:
        data = json.dumps(data)
        resp = Response(data, status=status_code,\
                        mimetype='application/json')
        return resp
    except Exception as e:
        raise(e)

@app.route('/teachme/profile')
def getProfile():
    try:
        token = request.args['token']
        token_data = verifyToken(token, app.config['PUBLIC_KEY'])
        print(token_data)
        data = findUserById(token_data['_id'], token_data['accountType'])
        print(data)
        data['_id'] = str(data['_id'])
        data['dateOfBirth'] = str(data['dateOfBirth'])
        data['accountType'] = token_data['accountType']
        status = 200
    except Exception as e:
        print(e)
        data= {'message': str(e)}
        status = 400
    return createResponse(data, status)

@app.route('/teachme/profile/classes', methods=['POST'])
def setProfileClasses():
    try:
        token = request.json['token']
        classes = request.json['classes']
        token_data = verifyToken(token, app.config['PUBLIC_KEY'])
        setUserClasses(token_data['_id'], classes)
        data = {'message': 'Success', 'token': token}
        status = 200
    except Exception as e:
        print(e)
        data= {'message': str(e)}
        status = 400
    return createResponse(data, status)
        

@app.route('/teachme/classes')
def getClasses():
    try:
        token = request.args['token']
        verifyToken(token, app.config['PUBLIC_KEY'])
        data = findClasses()
        status = 200
    except Exception as e:
        data= {'message': str(e)}
        status = 400
    return createResponse(data, status)

@app.route('/teachme/conversation/profile', methods=['POST'])
def getChatProfiles():
    #try:
    token = request.json['token']
    token_data = verifyToken(token, app.config['PUBLIC_KEY'])
    ids = request.json['ids']
    if token_data['accountType'] == 'Teacher':
        accountType = 'Student'
    else:
        accountType = 'Teacher'
    data = findChatProfiles(ids, accountType)
    print(data)
    status = 200
    #except Exception as e:
        #data= {'message': str(e)}
        #status = 400
    return createResponse(data, status)

api = Api(app)
app.run(host = '0.0.0.0', port = 3001)
