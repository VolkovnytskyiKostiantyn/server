import { ObjectID } from 'mongodb'


export default async function putTodo(client, id, updKeyValue) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos')
      .updateOne(
        { _id: ObjectID(id) }, { $set: updKeyValue }, { upsert: true },
      )
  })
}
