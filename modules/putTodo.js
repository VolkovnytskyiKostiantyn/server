import { ObjectID } from 'mongodb'
import { idToUpdate, updKeyValue } from '../server'


export default async function putTodo(client) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos')
      .updateOne(
        { _id: ObjectID(idToUpdate) }, { $set: updKeyValue }, { upsert: true },
      )
  })
}
