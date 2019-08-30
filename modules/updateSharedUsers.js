export default function updateSharedUsers(client, login, newSharedUsers) {
  const db = client.db('todos')
  return (
    db.collection('users')
      .updateOne(
        { login }, { $set: { sharedUsers: newSharedUsers } }, { upsert: true },
      )
  )
}
