# -*- coding: utf-8 -*-
"""
Created on Tue Jul 28 14:58:38 2020

@author: NixsM
"""

import pymongo
from datetime import datetime
from bson.objectid import ObjectId


client = pymongo.MongoClient("localhost", 27017)
db = client['TeachMe']

def findUserById(_id, accountType):
    collection = db[accountType]
    data = collection.find_one({'_id': ObjectId(_id)})
    return data

def setUserClasses(_id, classes):
    collection = db['Teacher']
    collection.update_one({'_id': ObjectId(_id)}, {'$set':{'classes': classes}})

def findClasses():
    collection = db['Classes']
    data = collection.find()
    class_list = []
    for point in data:
        point['_id'] = str(point['_id'])
        class_list.append(point)
    return class_list

def findChatProfiles(ids, accountType):
    ids = [ObjectId(userid) for userid in ids ]
    collection = db[accountType]
    fields = {'_id':1, 'name':1, 'surname': 1, 'profile_picture': 1}
    data = collection.find({'_id': {'$in': ids}}, fields)
    profiles = []
    for profile in data:
        profile['_id'] = str(profile['_id'])
        profiles.append(profile)
    return profiles