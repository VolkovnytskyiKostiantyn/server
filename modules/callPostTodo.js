// @flow
import postTodo from './postTodo'

export default async function callPostTodo(client: Object): Promise<Object> {
  const result = await postTodo(client)
  return result
}
