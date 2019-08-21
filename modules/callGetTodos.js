import getTodos from './getTodos'

export default async function callGetTodos(client) {
  const result = await getTodos(client)
  return result
}
