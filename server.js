// @flow
import express from 'express'
import type {
  $Application,
  $Request,
  $Response,
  NextFunction,
  Middleware,
 } from 'express'
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
import callDeleteMany from './modules/callDeleteMany'

const app: $Application = express()

let todo; let idToUpdate; let newUser; let token

app.use(express.static(`${__dirname}/public`))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(verifyToken)

app.use((req: $Request, res: $Response, next: NextFunction) => {
  res.append('Access-Control-Allow-Origin', '*')
  res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.append('Access-Control-Allow-Headers', 'Content-Type')
  res.append('Access-Control-Allow-Headers', 'Authorization')
  res.append('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers')
  res.append('Access-Control-Allow-Headers', 'X-Requested-With')
  next()
})

const url = 'mongodb+srv://1:2@mymongodbcluster-mwueg.mongodb.net/test?retryWrites=true&w=majority'
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true }
let connectedClient

MongoClient.connect(url, mongoOptions, (err: Error, client: Object): void => {
  assert.equal(null, err)
  console.log('connected')
  console.log('===================')
  connectedClient = client
  app.listen(9999)
  process.on('exit', () => {
    client.close()
  })
})

app.post('/signUp', async (req: $Request, res: $Response): Promise<void> => {
  const {
    login,
    password,
  } = req.body

  const lookingUser = await findUser(connectedClient, login).catch(() => {
    res.send('User already exists!')
  })
  const isUserExists = !!lookingUser

  if (isUserExists) {
    const { sharedUsers, hashedPassword } = lookingUser
    try {
      jwt.verify(req.headers.authorization.split(' ')[1], 'salt', async (err, decoded): Promise<void> => {
        await jwt.sign({ login }, 'salt', (e: Error, newToken: string) => {
          if (e) {
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
      })
    } catch (e) {
      console.log(e)
    }
  } else {
    try {
      await jwt.sign({ login }, 'salt', (err: Error, newToken: string) => {
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

app.post('/', (req: $Request, res: $Response): void => {
  jwt.verify(req.params.token, 'salt', (err, authData) => {
    const { title, owner } = req.body
    todo = { title, owner, isCompleted: false }

    callPostTodo(connectedClient)
      .then((result) => res.send(result))
      .catch((e) => {
        res.sendStatus(403)
      })
  })
})

app.get('/', async (req: $Request, res: $Response): Promise<void> => {
  try {
    const { login } = req.params.authData
    const user = await findUser(connectedClient, login)
    const { sharedUsers, externalUsers } = user
    const queryArray = [login, ...externalUsers].map((user) => ({ owner: user }))
    const todos = await getTodos(connectedClient, { $or: queryArray })
    res.send(JSON.stringify({
      todos, currentUser: login, sharedUsers, token, externalUsers,
    }))
  } catch (e) {
    console.log(e)
  }
})

app.get('/todos', async (req: $Request, res: $Response): Promise<void> => {
  try {
    const { login } = req.params.authData
    const user = await findUser(connectedClient, login)
    const { sharedUsers, externalUsers } = user
    const queryArray = [login, ...externalUsers].map((user) => ({ owner: user }))
    // console.log(queryArray)
    const todos = await getTodos(connectedClient, { $or: queryArray })
    // console.log(todos)
    res.send(JSON.stringify({
      todos, currentUser: login, sharedUsers, token, externalUsers,
    }))
  } catch (e) {
    console.log(e)
  }
})

app.delete('/', (req: $Request, res: $Response): void => {
  jwt.verify(req.params.token, 'salt', (err, authData) => {
    const { _id } = req.body

    callDeleteTodo(connectedClient, _id)
      .then((result) => res.send(result))
      .catch((err) => {
        res.sendStatus(403)
      })
  })
})

app.delete('/delete_many', (req: $Request, res: $Response): void => {
  jwt.verify(req.params.token, 'salt', (err, authData) => {
    const { idArr } = req.body
    callDeleteMany(connectedClient, idArr)
      .then((result) => res.send(result))
      .catch((err) => res.sendStatus(403))
  })
})


app.put('/', (req: $Request, res: $Response): void => {
  const { _id, updKeyValue } = req.body

  callPutTodo(connectedClient, _id, updKeyValue)
    .then((result) => res.send(result))
    .catch((err) => {
      res.sendStatus(403)
    })
})


app.put('/user/addSharedUser', async (req: $Request, res: $Response): Promise<void> => {
  const { user } = req.body
  const { login } = req.params.authData
  const currentUser = await findUser(connectedClient, login)
  const currentSharedUsers = currentUser.sharedUsers
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
