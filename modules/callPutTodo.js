import putTodo from './putTodo'

export default async function callPutTodo(client) {
  const result = await putTodo(client)
  return result
}
