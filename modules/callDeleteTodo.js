// @flow
import deleteTodo from './deleteTodo'

export default async function callDeleteTodo(client: Object, id: string) {
  const result = await deleteTodo(client, id)
  return result
}
