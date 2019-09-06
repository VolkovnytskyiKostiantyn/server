// @flow
import getUser from './getUser'

export default async function callGetUser(client: Object, login: string): {[key: string]: any} {
  const result = await getUser(client, login)
  console.log(result)
  return result
}
