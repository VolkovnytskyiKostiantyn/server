import deleteTodo from './deleteTodo'

export default async function callDeleteTodo(client) {
  const result = await deleteTodo(client)
  return result
}
