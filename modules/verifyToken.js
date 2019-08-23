export default function verifyToken(req, res, next) {
  const bearerHeader = req.headers.authorization
  console.log(req.headers)
  // console.log(`bh ${bearerHeader}`)
  if (typeof bearerHeader !== 'undefined') {
    const bearer = bearerHeader.split(' ')
    // console.log(`b ${bearer}`)
    const bearerToken = bearer[1]
    // console.log(`bt ${bearerToken}`)
    req.usersToken = bearerToken
    console.log(`VT req.token ${req.usersToken}`)
    next()
  } else {
    console.log('403 from VT')
    res.sendStatus(403)
  }
}
