// @flow
import { newUser } from '../server'

export default async function postUser(client: Object) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('users').insertOne(newUser)
  }).catch((err) => console.log(err))
}
