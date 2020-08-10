var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http, { pingInterval: 500000 });
const redisAdapter = require("socket.io-redis");
const redis = require("redis");
const { MongoClient, ObjectID } = require("mongodb");
var jwt = require("jsonwebtoken");
var fs = require("fs");

const url = "mongodb://localhost:27017";
const onlineUsers = redis.createClient();
const publisher = redis.createClient();
const subscriber = redis.createClient();
var key = "";
try {
  key = fs.readFileSync("./teachme-public.key", "utf-8");
} catch (e) {
  console.log("Error:", e.stack);
}

async function addConversation(teacher_id, student_id) {
  const client = await MongoClient.connect(url);
  const db = client.db("TeachMe");

  res = await db.collection("Conversations").findOne({
    teacher_id: ObjectID(teacher_id),
    student_id: ObjectID(student_id),
  });
  if (res) {
    return res._id.toString();
  } else {
    res = await db.collection("Conversations").insertOne({
      teacher_id: ObjectID(teacher_id),
      student_id: ObjectID(student_id),
    });
    return res.insertedId;
  }
}

async function getConversation(teacher_id, student_id) {
  const client = await MongoClient.connect(url);
  const db = client.db("TeachMe");
  res = await db.collection("Conversations").findOne({
    teacher_id: ObjectID(teacher_id),
    student_id: ObjectID(student_id),
  });
  return res;
}

async function getProfileConversations(accountType, userId) {
  const client = await MongoClient.connect(url);
  const db = client.db("TeachMe");

  const query = {};
  console.log(accountType);
  console.log(userId);
  if (accountType === "Teacher") {
    query.teacher_id = ObjectID(userId);
  } else {
    query.student_id = ObjectID(userId);
  }
  console.log(query);
  res = await db.collection("Conversations").find(query).toArray();
  return res;
}

async function addMessage(message) {
  const client = await MongoClient.connect(url);
  const db = client.db("TeachMe");
  db.collection("Messages").insertOne(message);
}

async function getMessages(conversationId, lastDate) {
  const client = await MongoClient.connect(url);
  const db = client.db("TeachMe");

  res = await db
    .collection("Messages")
    .find({
      conversationId: conversationId,
      createdAt: { $lt: lastDate },
    })
    .toArray();
  return res;
}

io.adapter(redisAdapter({ pubClient: publisher, subClient: subscriber }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "\\index.html");
});

app.get("/teachme/profile/conversations", async (req, res) => {
  const token = req.query.token;
  var keyByte = new Buffer(token, "base64");
  keyByte = keyByte.toString("ascii");
  try {
    decoded = jwt.verify(keyByte, key);
    conversations = await getProfileConversations(
      decoded.accountType,
      decoded._id
    );
    res.json({ conversations: conversations });
  } catch (err) {
    console.log(err);
  }
});

app.get("/teachme/conversation", async (req, res) => {
  const token = req.query.token;
  const teacher_id = req.query.teacher_id;
  const student_id = req.query.student_id;
  var keyByte = new Buffer(token, "base64");
  keyByte = keyByte.toString("ascii");
  try {
    jwt.verify(keyByte, key);
    conversation = await getConversation(teacher_id, student_id);
    res.json({ conversation: conversation._id.toString() });
  } catch (err) {
    console.log(err);
  }
});

app.get("/teachme/messages", async (req, res) => {
  const token = req.query.token;
  const conversationId = req.query.conversationId;
  const lastDate = req.query.lastDate;
  var keyByte = new Buffer(token, "base64");
  keyByte = keyByte.toString("ascii");
  try {
    jwt.verify(keyByte, key);
    messages = await getMessages(conversationId, lastDate);
    res.json({ messages: messages });
  } catch (err) {
    console.log(err);
  }
});

app.get("/notifier", (req, res) => {
  res.sendFile(__dirname + "\\notifier.html");
});

// middleware
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  var keyByte = new Buffer(token, "base64");
  keyByte = keyByte.toString("ascii");
  try {
    var decoded = jwt.verify(keyByte, key);
    onlineUsers.set(decoded._id, socket.id, redis.print);
    socket["userId"] = decoded._id;
    console.log("user Id: " + decoded._id);
    if (socket.handshake.query.classes !== "undefined") {
      const classes = socket.handshake.query.classes.split(",");
      console.log(classes);
      for (i = 0; i < classes.length; i++) {
        socket.join(classes[i], () => {
          let rooms = Object.keys(socket.rooms);
          console.log("A user has joined " + rooms);
        });
      }
    }
    return next();
  } catch (err) {
    console.log(err);
    return next(new Error("authentication error"));
  }
});

io.on("connection", (socket) => {
  console.log("A user connected");
  /**io.to(socket.id).emit("chat message", "Yout user id is " + userId);
  io.to(socket.id).emit("userId", userId);*/
  socket.conn.on("packet", function (packet) {
    if (packet.type === "ping") console.log("received ping");
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
    console.log("userId: " + socket.userId);
    console.log(socket.id);
    onlineUsers.del(socket.userId, function (err, reply) {
      if (err) {
        console.log(err);
      } else {
        console.log(reply);
      }
    });
    /**client.keys("*", function (err, keys) {
      if (err) throw err;
      console.log(keys);
    });*/
  });

  socket.on("registerUser", (user) => {
    onlineUsers.set(user._id, socket.id, redis.print);
  });

  socket.on("notify", (msg) => {
    console.log(msg);
    io.to(msg.classId).emit("notification", {
      message: "A student wants to connect with you.",
      studentId: msg.studentId,
      classId: msg.classId,
    });
  });

  socket.on("beginSession", (msg) => {
    console.log(msg);
    onlineUsers.get(msg.studentId, async function (err, value) {
      if (err) {
        console.log(err);
      } else {
        insertedId = await addConversation(msg.teacherId, msg.studentId);
        console.log(insertedId);
        io.to(value).emit("beginSession", {
          teacherId: msg.teacherId,
          conversationId: insertedId,
        });
        io.to(socket.id).emit("beginSession", {
          studentId: msg.studentId,
          conversationId: insertedId,
        });
        socket.to(msg.classId).emit("studentAssigned", {});
      }
    });
  });

  socket.on("goOffline", (msg) => {
    io.to(socket.id).emit("setStatus", { status: "offline" });
    const rooms = Object.keys(socket.rooms);
    for (i = 0; i < rooms.length; i++) {
      if (rooms[i] !== socket.id) {
        socket.leave(rooms[i]);
      }
    }
  });

  socket.on("goOnline", (msg) => {
    io.to(socket.id).emit("setStatus", { status: "online" });
    const classes = msg.classes;
    for (i = 0; i < classes.length; i++) {
      socket.join(classes[i], () => {
        let rooms = Object.keys(socket.rooms);
        console.log("A user has joined " + rooms);
      });
    }
  });

  socket.on("chat message", (msg) => {
    console.log(msg);
    const receiver = msg.to;
    onlineUsers.get(receiver, function (err, value) {
      if (err) {
        console.log("error");
        console.log(err);
      } else {
        console.log(value);
        io.to(value).emit("chat message", msg);
        addMessage(msg);
      }
    });
  });
});

http.listen(3002, () => {
  console.log("listening on *:3002");
});
