// @flow
export default function getTodos(client: Object, query: Object): Promise<Array<Object>> {
  const db = client.db('todos')
  return new Promise((resolve: (prop: Array<Object>) => void, reject: (prop: Error) => void) => {
    db.collection('todos').find(query)
      .toArray((err, todos) => {
        if (err) {
          reject(err)
        } else {
          resolve(todos)
        }
      })
  })
}
