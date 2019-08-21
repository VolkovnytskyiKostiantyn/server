import { todo } from '../server'

export default async function postTodo(client) {
  const db = client.db('todos')
  return new Promise(() => {
    db.collection('todos').insertOne(todo)
  })
}
