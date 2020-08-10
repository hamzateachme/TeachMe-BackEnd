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
      "profile_picture",
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
      class_ids: {
        bsonType: "array",
      },
    },
  },
};

const studentSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: [
      "_id",
      "profile_picture",
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

const classSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id", "level", "subject"],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      level: {
        bsonType: "string",
      },
      subject: {
        bsonType: "string",
      },
    },
  },
};

const conversationsSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["_id", "teacher_id", "student_id"],
    properties: {
      _id: {
        bsonType: "objectId",
      },
      teacher_id: {
        bsonType: "objectId",
      },
      student_id: {
        bsonType: "objectId",
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

db.createCollection("Classes", {
  autoIndexId: true,
  validator: classSchema,
  validationLevel: "strict",
});

db.createCollection("Conversations", {
  autoIndexId: true,
  validator: conversationsSchema,
  validationLevel: "strict",
});

db.Conversations.createIndex(
  { teacher_id: 1, student_id: 1 },
  { unique: true }
);

db.createCollection("Messages");
db.Messages.createIndex({ conversationId: 1, createdAt: 1 });

const initialClasses = [
  {
    level: "1",
    subject: "Maths",
  },
  {
    level: "2A",
    subject: "Physics",
  },
  {
    level: "2A",
    subject: "Economics",
  },
  {
    level: "2B",
    subject: "Islamiyat",
  },
  {
    level: "2B",
    subject: "English",
  },
  {
    level: "3A",
    subject: "Biology",
  },
  {
    level: "3A",
    subject: "Accounting",
  },
  {
    level: "3B",
    subject: "Maths",
  },
  {
    level: "3B",
    subject: "Chemistry",
  },
];

db.Classes.insertMany(initialClasses);
