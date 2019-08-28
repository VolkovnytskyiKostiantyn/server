import express from 'express'
import { MongoClient } from 'mongodb'
import bodyParser from 'body-parser'
import assert from 'assert'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


import callPutTodo from './modules/callPutTodo'
import callPostTodo from './modules/callPostTodo'
import callDeleteTodo from './modules/callDeleteTodo'
import callGetUser from './modules/callGetUser'
import callPostUser from './modules/callPostUser'
import callGetTodos from './modules/callGetTodos'
import checkIfUsersExists from './modules/checkIfUserExists'
import verifyToken from './modules/verifyToken'
import getTodos from './modules/getTodos'

const app = express()

let todo; let idToUpdate; let newUser; let token // let _id;

app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', ['*'])
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  res.append('Access-Control-Allow-Headers', 'Authorization')
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

app.post('/signUp', async (req, res) => {
  const {
    login,
    password,
  } = req.body

  const lookingUser = await checkIfUsersExists(connectedClient, login).catch(() => {
    res.send('User already exists!')
  })
  const isUserExists = !!lookingUser

  if (isUserExists) {
    const { sharedUsers, externalUsers, hashedPassword } = lookingUser
    try {
      await jwt.sign({ login, sharedUsers, externalUsers }, 'salt', (err, newToken) => {
        if (err) {
          res.send('token creating error')
        }
        token = newToken
      })
      console.log(`c token ${token}`)
      await bcrypt.compare(password, hashedPassword).then(async (isEqual) => {
        if (isEqual) {
          console.log(token)
          await connectedClient.db('todos').collection('users').updateOne({ login }, { $set: { token } }, { upsert: true })
          console.log('sendin token 1')
          res.send(token)
        } else {
          res.sendStatus(403)
        }
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    // if user doesnt exist - creating new
    try {
      await jwt.sign({ login, sharedUsers: [], externalUsers: [] }, 'salt', (err, newToken) => {
        if (err) {
          res.send('token creating error')
        }
        token = newToken
      })
      const hashedPassword = await bcrypt.hash(password, 10)
      newUser = {
        login, sharedUsers: [], externalUsers: [], hashedPassword, token,
      }
      console.log('3')
      await connectedClient.db('todos').collection('users').insertOne(newUser)
      console.log('sendin token 2')
      console.log(token)
      res.send(token)
    } catch (error) {
      res.send(error)
    }
  }
})

app.post('/', verifyToken, (req, res) => {
  jwt.verify(req.token, 'salt', (err, authData) => {
    const { title, owner } = req.body
    todo = { title, owner, isCompleted: false }

    callPostTodo(connectedClient)
      .then((result) => res.send(result))
      .catch((e) => {
        res.sendStatus(403)
      })
  })
})

app.get('/', verifyToken, async (req, res) => {
  try {
    const { login, externalUsers, sharedUsers } = req.authData
    console.log(login)
    const ownTodos = await callGetTodos(connectedClient, login)
    const promises = externalUsers.map((user) => getTodos(connectedClient, user))
    const externalTodos = await Promise.all(promises)
      .then((responses) => {
        console.log(responses)
        return Promise.all(responses.map((r) => r.json()))
      })
    console.log('+++')
    res.send({
      ownTodos, externalTodos, sharedUsers, externalUsers,
    })
  } catch (e) {
    console.log(e)
  }
})

app.delete('/', verifyToken, (req, res) => {
  jwt.verify(req.token, 'salt', (err, authData) => {
    const { _id } = req.body

    callDeleteTodo(connectedClient, _id)
      .then((result) => res.send(result))
      .catch((err) => {
        res.sendStatus(403)
      })
  })
})

app.put('/', verifyToken, (req, res) => {
  const { _id, updKeyValue } = req.body

  callPutTodo(connectedClient, _id, updKeyValue)
    .then((result) => res.send(result))
    .catch((err) => {
      res.sendStatus(403)
    })
})

app.put('/user/addSharedUser', verifyToken, async (req, res) => {
  const { user } = req.body
  const { login } = req.authData
  const currentUser = await callGetUser(connectedClient, login)
  const currentSharedUsers = currentUser.sharedUsers
  // console.log(currentUser.sharedUsers)
})


export {
  todo, idToUpdate, newUser, // _id as idToDelete,
}
