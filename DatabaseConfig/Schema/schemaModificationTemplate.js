db = db.getSiblingDB("TeachMe");

var newSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "_id",
      "name",
      "surname",
      "dateOfBirth",
      "phone",
      "identityDoc",
      "identityDoc2",
    ],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      name: {
        bsonType: "string",
        description: "must be a string and is required",
      },
      surname: {
        bsonType: "string",
        description: "must be a string and is required",
      },
      dateOfBirth: {
        bsonType: "date",
        description: "must be a date and is required",
      },
      phone: {
        bsonType: "int",
        description: "must be an integer an is required",
        pattern: "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$",
      },
      identityDoc: {
        bsonType: "string",
        description: "must be a string and required",
      },
    },
  },
};

db.runCommand({
  collMod: "Teacher",
  validator: newSchema,
  validationLevel: "moderate",
});
