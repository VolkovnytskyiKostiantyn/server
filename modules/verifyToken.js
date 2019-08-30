
import jwt from 'jsonwebtoken'
// export default function verifyToken(req, res, next) {
//   const bearerHeader = req.headers.authorization
//   console.log(req.headers)
//   // console.log(`bh ${bearerHeader}`)
//   console.log(`type of bh ${typeof bearerHeader}`)
//   if (typeof bearerHeader !== 'undefined') {
//     const bearer = bearerHeader.split(' ')
//     // console.log(`b ${bearer}`)
//     const bearerToken = bearer[1]
//     // console.log(`bt ${bearerToken}`)
//     req.usersToken = bearerToken
//     console.log(`VT req.token ${req.usersToken}`)
//     next()
//   } else {
//     console.log('403 from VT')
//     res.sendStatus(403)
//   }
// }

export default function verifyToken(req, res, next) {
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
      req.authData = decoded
      next()
    }
  } catch (e) {
    console.log('403 from VT err')
    res.sendStatus(403)
  }
}
