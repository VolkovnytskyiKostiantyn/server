import findUser from './findUser'

export default async function updateExternalUsers(client, sharedUser, sharingUser) {
  try {
    const db = client.db('todos')
    const updatingUser = await findUser(client, sharedUser)
    console.log('sharedUser')
    console.log(sharedUser)
    console.log('===================')
    console.log('updatingUser')
    console.log(updatingUser)
    console.log('===================')
    const currentExternalUsers = updatingUser.externalUsers
    currentExternalUsers.push(sharingUser)
    console.log('currentExternalUsers')
    console.log(currentExternalUsers)
    console.log('===================')
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
