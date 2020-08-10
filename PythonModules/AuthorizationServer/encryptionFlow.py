# -*- coding: utf-8 -*-
"""
Created on Mon Jul 27 15:11:36 2020

@author: NixsM
"""

from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_v1_5
import base64
import jwt
import bcrypt
import pymongo


client = pymongo.MongoClient("localhost", 27017)
db = client['TeachMe']


def generateToken(payload, private_key):
    token = jwt.encode(payload, 
                       private_key, 
                       algorithm='RS256')
    token = base64.b64encode(token)
    token = token.decode('ascii')
    return token

def verifyToken(token, public_key):
    token = base64.b64decode(token.encode('ascii'))
    print(token)
    try:
        jwt.decode(token, public_key, algorithms='RS256')
        return True
    except Exception as e:
        print(e)
        return False

def encrypt(msg, public_key):
    rsa = RSA.importKey(public_key)
    cipher = PKCS1_v1_5.new(rsa)
    ciphertext = cipher.encrypt(msg.encode('utf-8'))
    ciphertext = base64.b64encode(ciphertext)
    ciphertext = ciphertext.decode('ascii')
    return ciphertext

def decrypt(msg, private_key):
    rsa = RSA.importKey(private_key)
    cipher = PKCS1_v1_5.new(rsa)
    ciphertext = base64.b64decode(msg.encode('ascii'))
    plaintext = cipher.decrypt(ciphertext, b'DECRYPTION FAILED')
    return plaintext.decode('utf8')

def hashPassword(password):
    password = password.encode('utf-8')
    hashedPassword = bcrypt.hashpw(password, bcrypt.gensalt())
    hashedPassword = base64.b64encode(hashedPassword)
    hashedPassword = hashedPassword.decode('ascii')
    return hashedPassword

def checkPassword(password, hashedPassword):
    hashedPassword = hashedPassword.encode('ascii')
    hashedPassword = base64.b64decode(hashedPassword)
    if bcrypt.checkpw(password.encode('utf-8'), hashedPassword):
        return True
    else:
        return False


