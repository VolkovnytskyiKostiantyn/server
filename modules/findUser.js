// @flow
export default function findUser(client: Object, login: string) {
  const db = client.db('todos')
  return db.collection('users').findOne({ login })
}
