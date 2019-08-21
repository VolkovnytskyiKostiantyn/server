import postUser from './postUser'

export default async function callPostUser(client) {
  const result = postUser(client).then((res) => res.json()).catch((err) => console.log(err))
  return result
}
