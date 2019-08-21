import { ObjectID } from 'mongodb'
import { idToDelete } from '../server'

export default async function deleteTodo(client) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos').deleteOne({ _id: ObjectID(idToDelete) })
  })
}
