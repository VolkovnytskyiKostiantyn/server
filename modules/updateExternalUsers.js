// @flow
import findUser from './findUser'

export default async function updateExternalUsers(client: Object, sharedUser: string, sharingUser: string) {
  try {
    const db = client.db('todos')
    const updatingUser = await findUser(client, sharedUser)
    const currentExternalUsers = updatingUser.externalUsers
    currentExternalUsers.push(sharingUser)
    //   console.log(currentExternalUsers)
    return (
      db.collection('users')
        .updateOne(
          { login: sharedUser }, { $set: { externalUsers: currentExternalUsers } },
        //  { upsert: true },
        )
    )
  } catch (e) {
    return 'no such user'
  }
}
