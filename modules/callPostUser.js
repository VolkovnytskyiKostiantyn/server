// @flow
import postUser from './postUser'

export default async function callPostUser(client: Object): Object{
  const result = postUser(client).then((response) => response.json()).catch((err) => console.log(err))
  return result
}
