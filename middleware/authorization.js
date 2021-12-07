//This middleware will on continue on if the token is inside the local storage

const jwt = require('jsonwebtoken')
require('dotenv').config()
module.exports = async (req, res, next) => {
  // Get token from header
  try {
    const jwtToken = req.header('token')

    // Check if token is invalid
    if (!jwtToken) {
      return res.status(403).json({ msg: 'authorization denied' })
    }
    // Verify token
    //it is going to give us the user id (user:{id: user.id})
    const payload = jwt.verify(jwtToken, process.env.JWT_KEY)
    req.id = payload.tokenData

    next()
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
