// @flow
export default async function getUser(client: Object, login: string) {
  const db = client.db('todos')
  return new Promise((resolve, reject) => {
    db.collection('users')
      .findOne({ login })
  })
}
