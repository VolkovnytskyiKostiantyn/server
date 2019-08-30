export default function findUser(client, login) {
  const db = client.db('todos')
  return db.collection('users').findOne({ login })
}
