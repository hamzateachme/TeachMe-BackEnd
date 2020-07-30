# -*- coding: utf-8 -*-
"""
Created on Sat Jul 25 19:19:51 2020

@author: NixsM
"""

from flask import Flask, Response, request, send_file
from flask_restful import Api, Resource
from flask_cors import CORS
import json
from encryptionFlow import encrypt, decrypt, checkPassword, generateToken
from mongo_queries import findUserByEmail, addTeacher, addStudent, addUser, deleteUser
import jwt
import time
import os
import base64

ALLOWED_EXTENSIONS = { 'png', 'jpg', 'jpeg'}
app = Flask(__name__)
cors = CORS(app)
app.config.from_object('config')
app.config['UPLOAD_FOLDER'] = './images/'

clientKey = ""

@app.route('/teachme/')
def keygen():
    data = {'key': app.config['PUBLIC_KEY']}
    data = json.dumps(data)
    resp = Response(data,status=200,\
                mimetype='application/json')
    return resp

@app.route('/teachme/secure', methods=['POST'])
def receiveClientKey():
    global clientKey
    try:
        key = request.json['key']
        try:
            clientKey = decrypt(key, app.config['PRIVATE_KEY'])
            print(clientKey)
            message = "Success"
        except:
            message = "Server Error"
    except:
        message = "Bad Request"
    data = json.dumps({'message': message})
    resp = Response(data, status=200,\
                    mimetype='application/json')
    return resp


@app.route('/teachme/login', methods=['POST'])
def authenticate():
    try:
        email = request.json['email']
        password = request.json['password']
        try:
            user = findUserByEmail(email)
            if user != None:
                if checkPassword(password, user['password']):
                    message =  "Access Granted"
                    token = generateToken({'_id': str(user['_id']), 'accountType': user['accountType']},
                                          app.config['PRIVATE_KEY'])
                    data = {'message': message, 'token': token}
                    status = 200
                else:
                    data = {'message': "Wrong Password"}
                    status = 401
            else:
                data = {'message': "No User Record Found. Please SignUp"}
                status = 401

        except Exception as e:
            print(e)
            data= {'message': "Server Error"}
            status = 500
    except:
        data= {'message': 'Bad Request'}
        status = 400
    #    if checkPassword(email, password):
#        print("Correct Credentials")
#    else:
#        print("Wrong Credentials")
    #print(message.decode('utf-8'))
    #cipher = PKCS1_OAEP.new(RSA.importKey(app.config['JWT_SECRET_KEY']))
    #message = cipher.decrypt(message)
    ##print(message)
    ##cipher = PKCS1_OAEP.new(app.config['JWT_SECRET_KEY'])
    ##message = cipher.decrypt(message)
    ##message = rsa.decrypt(message, rsa.PrivateKey.load_pkcs1(app.config['JWT_SECRET_KEY']))

    return createResponse(data, status)

@app.route('/teachme/profile_picture/<string:filename>')
def getImage(filename):
    return send_file(os.path.join(app.config['UPLOAD_FOLDER'], "profile_pictures\\"+ filename), mimetype='image/jpeg')



@app.route('/teachme/register', methods=['POST'])
def register():
    try:
        profile_picture = request.form['profile_picture']
        email = request.form['email']
        password = request.form['password']
        name = request.form['name']
        surname = request.form['surname']
        dateOfBirth = request.form['dateOfBirth']
        phone = request.form['phoneNumber']
        accountType = request.form['accountType']
        if accountType == 'Teacher':
            identityDoc = request.form['identityDoc']
        try:
           _id = addUser(email, password, accountType)

           with open(os.path.join(app.config['UPLOAD_FOLDER'], "profile_pictures\\"+str(_id)+".jpg"), "wb") as imagefile:
               imagefile.write(base64.decodebytes(profile_picture.encode('ascii')))
           profile_picture = "http://192.168.18.55:3000/teachme/profile_picture/"+str(_id)+".jpg"
           try:
               if accountType == 'Teacher':
                   with open(os.path.join(app.config['UPLOAD_FOLDER'], "identity_documents\\"+str(_id)+".jpg"), "wb") as imagefile:
                       imagefile.write(base64.decodebytes(identityDoc.encode('ascii')))
                   identityDoc = "http://192.168.18.55:3000/teachme/identity_document/"+str(_id )+".jpg"

                   _id = addTeacher(_id, profile_picture, name, surname, dateOfBirth, phone, identityDoc)
               else:
                   _id = addStudent(_id, profile_picture, name, surname, dateOfBirth, phone)
           except Exception as e:
               print(e)
               deleteUser(email)
               data= {'message': str(e)}
               status = 500
           token = generateToken({'_id': str(_id), 'accountType': accountType},
                                  app.config['PRIVATE_KEY'])
           data = {'message': 'Success', 'token': token}
           status = 200
        except Exception as e:
            print(e)
            data= {'message': str(e)}
            status = 500
    except Exception as e:
        print(e)
        data= {'message': 'Bad Request'}
        status = 400

    return createResponse(data, status)


def createResponse(data, status_code):
    data = json.dumps(data)
    resp = Response(data, status=status_code,\
                    mimetype='application/json')
    return resp

api = Api(app)
app.run(host = '0.0.0.0', port = 3000, debug=True)

# Hash a password for the first time, with a randomly-generated salt
#print(bcrypt.gensalt())
#hashed = bcrypt.hashpw(password, bcrypt.gensalt())
#print(hashed)
# Check that an unhashed password matches one that has previously been
# hashed
#if bcrypt.checkpw(password, b'$2b$12$s8s7FdMRp2TUJnt.MhhbXumCM1Ge57FNgLL8nSCQ3Xom8jbH0N8Q6'):
#    print("It Matches!")
#else:
#    print("It Does not Match :(")

#app.config['JWT_ALGORITHM'] = 'RS256'
#app.config['JWT_SECRET_KEY'] = open('./config/teachme-debug.key').read()
#app.config['JWT_PUBLIC_KEY'] = open('./config/mypublickey.pem').read()
#ciphertext = encrypt("password", app.config['PUBLIC_KEY'])
#plaintext = decrypt(ciphertext, app.config['PRIVATE_KEY'])
#print(plaintext)
#cipher = PKCS1_OAEP.new(RSA.importKey(app.config['JWT_PUBLIC_KEY']))
#message = cipher.encrypt(message)
#print(message)
#cipher = PKCS1_OAEP.new(RSA.importKey(app.config['JWT_SECRET_KEY']))
#message = cipher.decrypt(message)
#crypto = rsa.encrypt(message, rsa.PublicKey.load_pkcs1(app.config['JWT_PUBLIC_KEY']))
#message = rsa.decrypt(crypto, rsa.PrivateKey.load_pkcs1(app.config['JWT_SECRET_KEY']))
