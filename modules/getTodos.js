export default async function getTodos(client) {
  const db = client.db('todos')
  return new Promise((resolve, reject) => {
    db.collection('todos')
      .find({})
      .toArray((err, todos) => {
        if (err) {
          reject(todos)
        } else {
          resolve(todos)
        }
      })
  })
}
