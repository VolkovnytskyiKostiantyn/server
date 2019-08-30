import getUser from './getUser'

export default async function callGetUser(client, login) {
  const result = await getUser(client, login)
  console.log(result)
  return result
}
