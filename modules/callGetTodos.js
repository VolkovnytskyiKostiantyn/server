import getTodos from './getTodos'

export default async function callGetTodos(client, login) {
  const result = await getTodos(client, login)
  return result
}
