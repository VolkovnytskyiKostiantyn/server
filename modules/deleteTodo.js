// @flow
import { ObjectID } from 'mongodb'

export default async function deleteTodo(client: Object, id: string) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos').deleteOne({ _id: ObjectID(id) })
  })
}
