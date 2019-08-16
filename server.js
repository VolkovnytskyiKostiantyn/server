const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;
const bodyParser = require("body-parser");
const assert = require("assert");

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*']);
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.append('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const url =
  "mongodb+srv://1:2@mymongodbcluster-mwueg.mongodb.net/test?retryWrites=true&w=majority";
const mongoOptions = { useNewUrlParser: true };
let connectedClient;

MongoClient.connect(url, mongoOptions, (err, client) => {
  assert.equal(null, err);
  console.log("connected");
  connectedClient = client;
  app.listen(9999);
  process.on("exit", () => {
    client.close();
  });
});

app.post("/", (req, res) => {
  const todoTitle = req.body.title;
  const todo = { title: todoTitle, isCompleted: false };
  let postTodo = client => {
    const db = client.db("todos");
    return new Promise((resolve, reject) => {
      db.collection("todos").insertOne(todo);
    });
  };
  let callPostTodo = async client => {
    let result = await postTodo(client);
    return result;
  };

  callPostTodo(connectedClient).then(result => {
    res.json(result);
  });

});

app.get("/", (req, res, next) => {
  try {
    const getTodos = client => {
      const db = client.db("todos");
      return new Promise((resolve, reject) => {
        db.collection("todos")
          .find({})
          .toArray((err, todos) => {
            err ? reject(todos) : resolve(todos);
          });
      });
    };
    const callGetTodos = async client => {
      let result = await getTodos(client);
      return result;
    };
      callGetTodos(connectedClient).then(result => {
        res.json(result)
      });
  } catch(e) {
  }
});

app.delete("/", (req, res) => {
  const idToDelete = req.body._id;
  console.log(idToDelete)
  const deleteTodo = client => {
    const db = client.db("todos");
    return new Promise((resolve, reject) => {
      db.collection("todos").deleteOne({_id: objectId(idToDelete)});
    });
  };
  const callDeleteTodo = async client => {
    let result = await deleteTodo(client);
    return result;
  };
    callDeleteTodo(connectedClient).then(result => {
      res.json(result);
    });
});

app.put("/", (req, res) => {
  const idToUpdate = req.body._id;
  const updKeyValue = req.body.updKeyValue;
  const putTodo = client => {
    const db = clent.db("todos");
    return new Promise((resolve, reject) => {
      db.collection.updateOne({_id: objectId(idToUpdate)}, updKeyValue);
    })
  }
  const callPutTodo = async client => {
    let result = await putTodo(client);
    return result;
  }
  callPutTodo(connectedClient).then(result => {
    res.json(result);
  })
});