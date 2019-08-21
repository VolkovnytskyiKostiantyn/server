export default function checkIfUserExists(client, login) {
  const db = client.db('todos')
  return db.collection('users').findOne({ login })
}
