export default async function getUser(client, login) {
  const db = client.db('todos')
  return new Promise((resolve, reject) => {
    db.collection('users')
      .findOne({ login })
  })
}
