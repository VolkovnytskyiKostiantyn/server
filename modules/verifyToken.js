// @flow

import jwt from 'jsonwebtoken'
import type {
  $Request,
  $Response,
  NextFunction,
 } from 'express'

export default function verifyToken (req: $Request, res: $Response, next: NextFunction) {
  const bearerHeader = req.headers.authorization
  const bearer = bearerHeader.split(' ')
  const bearerToken = bearer[1]
  let decoded = null
  try {
    decoded = jwt.verify(bearerToken, 'salt')
    if (!decoded) {
      console.log('403 from VT decoded')
      res.sendStatus(403)
    } else {
      req.params.authData = decoded
      req.params.token = bearerToken
      next()
    }
  } catch (e) {
    console.log(e)
    res.sendStatus(403)
  }
}
