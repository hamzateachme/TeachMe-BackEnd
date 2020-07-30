# -*- coding: utf-8 -*-
"""
Created on Mon Jul 27 18:13:32 2020

@author: NixsM
"""
import pymongo
from datetime import datetime


from encryptionFlow import hashPassword
profileServer = "localhost"
client = pymongo.MongoClient("localhost", 27017)


def addTeacher(_id, profile_picture, name, surname, dateOfBirth, phone, identityDoc):
    profileDatabase = pymongo.MongoClient(profileServer, 27017)
    db1 = profileDatabase['TeachMe']
    collection = db1['Teacher']
    dateOfBirth = datetime.strptime(dateOfBirth, '%Y-%m-%dT%H:%M:%S.%f%z')
    phone = int(phone)
    try:
        _id = collection.insert_one({'_id': _id,
                               'profile_picture': profile_picture,
                               'name': name, 
                               'surname': surname,
                               'dateOfBirth': dateOfBirth, 
                               'phone': phone, 
                               'identityDoc': identityDoc, 
                               'rating': 0,
                               'balance': 0,
                               'status': 'bronze'}).inserted_id
        return _id
    except Exception as e:
        raise(e)
    


def addStudent(_id,profile_picture, name, surname, dateOfBirth, phone):    
    profileDatabase = pymongo.MongoClient(profileServer, 27017)
    db1 = profileDatabase['TeachMe']
    collection = db1['Student']
    dateOfBirth = datetime.strptime(dateOfBirth, '%Y-%m-%dT%H:%M:%S.%f%z')
    phone = int(phone)
    print(phone)
    try:
        _id = collection.insert_one({'_id': _id,
                               'profile_picture': profile_picture,
                               'name': name, 
                               'surname': surname,
                               'dateOfBirth': dateOfBirth, 
                               'phone': phone, 
                               'rating': 0,
                               'balance': 0,
                               'status': 'bronze'}).inserted_id
        return _id
    except Exception as e:
        raise(e)

def addUser(email, password, accountType):
    db = client['TeachMe']
    collection = db['authentication']
    try:
        password = hashPassword(password)
        accountType = 'Student'
        _id = collection.insert_one({'email': email, 'password': password, 'accountType': accountType}).inserted_id
        return _id
    except Exception as e:
        print(e)
        raise(e)

def deleteUser(email):
    db = client['TeachMe']
    collection = db['authentication']
    collection.delete_one({'email': email})

def findUserByEmail(email):
    db = client['TeachMe']
    collection = db['authentication']
    data = collection.find_one({'email': email})
    return data

