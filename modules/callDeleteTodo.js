import deleteTodo from './deleteTodo'

export default async function callDeleteTodo(client, id) {
  const result = await deleteTodo(client, id)
  return result
}
