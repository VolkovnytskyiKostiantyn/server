export default function getTodos(client, query) {
  const db = client.db('todos')
  return new Promise((resolve, reject) => {
    db.collection('todos').find(query)
      .toArray((err, todos) => {
        if (err) {
          reject(todos)
        } else {
          resolve(todos)
        }
      })
  })
}
