// @flow
import putTodo from './putTodo'

export default async function callPutTodo(client: Object, id: string, updKeyValue: Object) {
  const result = await putTodo(client, id, updKeyValue)
  return result
}
