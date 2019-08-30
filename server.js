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
import findUser from './modules/findUser'
import verifyToken from './modules/verifyToken'
import getTodos from './modules/getTodos'
import updateSharedUsers from './modules/updateSharedUsers'
import updateExternalUsers from './modules/updateExternalUsers'

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
  console.log('===================')
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

  const lookingUser = await findUser(connectedClient, login).catch(() => {
    res.send('User already exists!')
  })
  const isUserExists = !!lookingUser

  if (isUserExists) {
    // console.log('1')
    const { sharedUsers, hashedPassword } = lookingUser
    try {
      await jwt.sign({ login }, 'salt', (err, newToken) => {
        if (err) {
          res.send('token creating error')
        }
        token = newToken
      })
      await bcrypt.compare(password, hashedPassword).then(async (isEqual) => {
        if (isEqual) {
          await connectedClient.db('todos').collection('users').updateOne({ login }, { $set: { token } }, { upsert: true })
          res.send(token)
        } else {
          res.sendStatus(403)
        }
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    // console.log('1')
    // if user doesnt exist - creating new
    try {
      await jwt.sign({ login }, 'salt', (err, newToken) => {
        if (err) {
          res.send('token creating error')
        }
        token = newToken
      })
      const hashedPassword = await bcrypt.hash(password, 10)
      newUser = {
        login, sharedUsers: [], externalUsers: [], hashedPassword, token,
      }
      await connectedClient.db('todos').collection('users').insertOne(newUser)
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
    const { login } = req.authData
    const currentUser = await findUser(connectedClient, login)
    const { sharedUsers, externalUsers } = currentUser
    // console.log(login)
    // console.log(externalUsers)
    const queryArray = [login, ...externalUsers].map((user) => ({ owner: user }))
    // console.log(queryArray)
    const todos = await getTodos(connectedClient, { $or: queryArray })
    // console.log(todos)
    res.send(JSON.stringify({
      todos, login, sharedUsers, token, externalUsers,
    }))
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
  console.log('user/login')
  console.log(user)
  console.log(login)
  console.log('===================')
  const currentUser = await findUser(connectedClient, login)
  console.log('currentUser')
  console.log(currentUser)
  console.log('===================')
  const currentSharedUsers = currentUser.sharedUsers
  console.log('currentSharedUsers')
  console.log(currentSharedUsers)
  console.log('===================')
  const usersIndex = currentSharedUsers.findIndex((item) => user === item)
  const isUserAlreadyShared = usersIndex >= 0
  if (!isUserAlreadyShared) {
    currentSharedUsers.push(user)
  } else {
    const movedUser = currentSharedUsers.splice(usersIndex, 1)
    currentSharedUsers.push(movedUser[0])
  }
  await updateSharedUsers(connectedClient, login, currentSharedUsers)
  await updateExternalUsers(connectedClient, user, login)
  await jwt.sign({ login }, 'salt', (err, newToken) => {
    if (err) {
      res.send('token creating error')
    }
    token = newToken
  })

  res.send({ currentSharedUsers, token })
})


export {
  todo, idToUpdate, newUser,
}
