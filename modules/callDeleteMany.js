// @flow
import deleteMany from './deleteMany'

export default async function callDeleteMany(client: Object, idArr: string[]): Promise<Object> {
  const result = await deleteMany(client, idArr)
  return result
}
