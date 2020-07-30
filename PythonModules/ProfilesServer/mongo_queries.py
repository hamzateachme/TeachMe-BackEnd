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