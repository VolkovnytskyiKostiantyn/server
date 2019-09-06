// @flow
export default function updateSharedUsers(client: Object, login: string, newSharedUsers: string[]) {
  const db = client.db('todos')
  return (
    db.collection('users')
      .updateOne(
        { login }, { $set: { sharedUsers: newSharedUsers } }, { upsert: true },
      )
  )
}
