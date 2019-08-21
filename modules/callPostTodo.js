import postTodo from './postTodo'

export default async function callPostTodo(client) {
  const result = await postTodo(client)
  return result
}
