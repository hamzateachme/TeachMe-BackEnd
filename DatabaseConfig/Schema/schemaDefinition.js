//db = conn.getDB("TeachMe");
db = db.getSiblingDB("TeachMe");
const authenticationSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id", "email", "password", "accountType"],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      email: {
        bsonType: "string",
        description: "must be a string and is required",
      },
      password: {
        bsonType: "string",
        description: "must be a hash string and is required",
      },
      accountType: {
        bsonType: "string",
        description: "must be a string and is required",
      },
    },
  },
};

const teacherSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "_id",
      "name",
      "surname",
      "dateOfBirth",
      "phone",
      "identityDoc",
      "rating",
      "balance",
      "status",
    ],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      profile_picture: {
        bsonType: "string",
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
        bsonType: "long",
        description: "must be an integer an is required",
        pattern: "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$",
      },
      identityDoc: {
        bsonType: "string",
        description: "must be a string and required",
      },
      rating: {
        bsonType: "int",
      },
      balance: {
        bsonType: "int",
      },
      status: {
        bsonType: "string",
      },
    },
  },
};

const studentSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "_id",
      "name",
      "surname",
      "dateOfBirth",
      "phone",
      "rating",
      "balance",
      "status",
    ],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      profile_picture: {
        bsonType: "string",
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
        bsonType: "long",
        description: "must be an integer an is required",
        pattern: "^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$",
      },
      rating: {
        bsonType: "int",
      },
      balance: {
        bsonType: "int",
      },
      status: {
        bsonType: "string",
      },
    },
  },
};

db.createCollection("authentication", {
  autoIndexId: true,
  validator: authenticationSchema,
  validationLevel: "strict",
});

db.authentication.createIndex({ email: 1 }, { unique: true });

db.createCollection("Teacher", {
  autoIndexId: true,
  validator: teacherSchema,
  validationLevel: "strict",
});

db.createCollection("Student", {
  autoIndexId: true,
  validator: studentSchema,
  validationLevel: "strict",
});
