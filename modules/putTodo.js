// @flow
import { ObjectID } from 'mongodb'


export default async function putTodo(client: Object, id: string, updKeyValue: Object) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos')
      .updateOne(
        { _id: ObjectID(id) }, { $set: updKeyValue }, { upsert: true },
      )
  })
}
