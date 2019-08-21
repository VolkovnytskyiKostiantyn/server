import express from 'express'
import { MongoClient } from 'mongodb'
import bodyParser from 'body-parser'
import assert from 'assert'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


import callPutTodo from './modules/callPutTodo'
import callPostTodo from './modules/callPostTodo'
import callDeleteTodo from './modules/callDeleteTodo'
import callGetTodos from './modules/callGetTodos'
import callPostUser from './modules/callPostUser'
import checkIfUsersExists from './modules/checkIfUserExists'
import verifyToken from './modules/verifyToken'

const app = express()

let { todo, idToDelete, idToUpdate, updKeyValue, newUser }

app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*'])
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

const url = 'mongodb+srv://1:2@mymongodbcluster-mwueg.mongodb.net/test?retryWrites=true&w=majority'
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true }
let connectedClient

MongoClient.connect(url, mongoOptions, (err, client) => {
  assert.equal(null, err)
  console.log('connected')
  connectedClient = client
  app.listen(9999)
  process.on('exit', () => {
    client.close()
  })
})

app.post('/signUp', (req, res) => {
  const {
    login,
    password,
  } = req.body
  bcrypt.hash(password, 10)
    .then((hashedPassword) => {
      jwt.sign({ login }, 'salt', async (err, token) => { //  { expiresIn: '30s' },
        newUser = { login, hashedPassword, token }
        const lookingUser = await checkIfUsersExists(connectedClient, login).catch((err) => {
          res.send('User already exists!')
        })
        const isUserExists = !!lookingUser
        console.log(isUserExists)
        if (isUserExists) {
          //checkin for token validity
          jwt.verify(token, 'salt', async (err, authData) => {
            console.log('1')
            if (err) {
              console.log('2')
              res.send(err)
            } else {
              //comparing entered pass with hashed copy from DB
              bcrypt.compare(password, lookingUser.hashedPassword).then((isEqual) => {
                if (isEqual) {
                  res.send(token)
                } else {
                  res.send('Wrong password!')
                }
              })
            }
          })
        } else {
          // if user doesnt exist - creating new
          console.log('3')
          try {
            await connectedClient.db('todos').collection('users').insertOne(newUser)
            res.send(token)
          } catch (error) {
            console.log(error)
          }
        }
      })
    })
})

app.post('/', verifyToken, (req, res) => {
  const todoTitle = req.body.title
  todo = { title: todoTitle, isCompleted: false }

  callPostTodo(connectedClient)
    .then((result) => {
      res.json(result)
        .catch((err) => console.log(err))
    })
})

app.get('/', verifyToken, (req, res, next) => {
  callGetTodos(connectedClient)
    .then((result) => {
      res.json(result)
    })
    .catch((err) => console.log(err))
})

app.delete('/', verifyToken, (req, res) => {
  idToDelete = req.body._id

  callDeleteTodo(connectedClient)
    .then((result) => {
      res.json(result)
    })
    .catch((err) => console.log(err))
})

app.put('/', verifyToken, (req, res) => {
  idToUpdate = req.body._id
  updKeyValue = req.body.updKeyValue

  callPutTodo(connectedClient)
    .then((result) => {
      res.json(result)
        .catch((err) => console.log(err))
    })
})


export {
  todo, idToDelete, idToUpdate, updKeyValue, newUser,
}
