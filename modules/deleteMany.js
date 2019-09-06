// @flow
import { ObjectID } from 'mongodb'

export default async function deleteTodo(client: Object, idArr: string[]) {
  const query = idArr.map((id) => ({ _id: ObjectID(id) }))
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos').deleteMany({ $or: query })
  })
}
