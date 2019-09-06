// @flow
import getTodos from './getTodos'

export default async function callGetTodos(client: Object, login: string): Promise<Array<{[key: string]: any}>> {
  const result = await getTodos(client, login)
  return result
}
