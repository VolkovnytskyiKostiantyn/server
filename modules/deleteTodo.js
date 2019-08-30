import { ObjectID } from 'mongodb'

export default async function deleteTodo(client, id) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos').deleteOne({ _id: ObjectID(id) })
  })
}
