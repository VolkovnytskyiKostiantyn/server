import putTodo from './putTodo'

export default async function callPutTodo(client, id, updKeyValue) {
  const result = await putTodo(client, id, updKeyValue)
  return result
}
