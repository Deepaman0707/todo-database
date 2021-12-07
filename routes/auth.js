// Required Imports
const express = require('express')
const router = express.Router()
const pool = require('../db/db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { body, validationResult } = require('express-validator')
const authorization = require('../middleware/authorization')

//ROUTE 1: This route is used for registering a new users in the database.

router.post(
  '/register',
  [
    body('Name', 'Name must be atleast 3 characters.').isLength({
      min: 3,
    }),
    body('Email', 'Enter a valid Email.').isEmail(),
    body('Password', 'Password must be atleast 5 characters.').isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      let success = false
      // Verifying the input data using express validator.
      const errors = validationResult(req)
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })

      // Destructuring the input data and checking its existence in the database.
      const { Name, Email, Password } = req.body
      const user = await pool.query('SELECT * FROM users WHERE Email = $1', [
        Email,
      ])

      // If it is already in the database then returning the process with a message.
      if (user.rows.length !== 0)
        return res.status(401).json('User Already Exist!')

      // If it is a new user then hashing its entered password using bcrypt package.
      const salt = await bcrypt.genSalt(10)
      const bcryptPassword = await bcrypt.hash(Password, salt)

      // Storing the user's data into the database.
      await pool.query(
        'INSERT INTO users (Name, Email, Password, date) values ($1, $2, $3, current_timestamp)',
        [Name, Email, bcryptPassword]
      )

      // Retrieving user's id to generate an auth token.
      const data = await pool.query('SELECT * FROM users WHERE Email = $1', [
        Email,
      ])

      // Generating auth token using jwt package.
      const tokenData = data.rows[0].user_id
      const authToken = jwt.sign({ tokenData }, process.env.JWT_KEY)
      success = true
      // Returning response : auth token
      res.send({ success, authToken })
    } catch (err) {
      console.error(err.message)
      res.status(500).send(err.message)
    }
  }
)

//ROUTE 2: This route is used for login a existing users in the database.

router.post(
  '/login',
  [
    body('Email', 'Enter a valid Email.').isEmail(),
    body('Password', 'Enter the password.').exists(),
  ],
  async (req, res) => {
    try {
      let success = false
      // Verifying the input data using express validator.
      const errors = validationResult(req)
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })

      // Destructuring the input data and checking its existence in the database.
      const { Email, Password } = req.body
      const user = await pool.query('SELECT * FROM users WHERE Email = $1', [
        Email,
      ])

      // If there is no such user in the database then returning the process with a message.
      if (user.rows.length === 0)
        return res.status(401).json('User Not Found!!')

      // If there is an user in the database with that E-mail then checking the hashed password with the entered password using bcrypt package.
      const validPassword = await bcrypt.compare(
        Password,
        user.rows[0].password
      )

      // If the password doesn't match then returning the process with a message.
      if (!validPassword) return res.status(401).json('Invalid Credential')

      // If the entered data is correct then generating auth token for that.
      const tokenData = user.rows[0].user_id
      const authToken = jwt.sign({ tokenData }, process.env.JWT_KEY)
      success = true

      // Sending auth token as a response.
      res.send({ success, authToken })
    } catch (err) {
      console.error(err.message)
      res.status(500).send(err.message)
    }
  }
)

//ROUTE 3: Get all the users detail.

router.post('/details', authorization, async (req, res) => {
  try {
    // Fetching data using a middleware.
    const data = await pool.query(
      'SELECT name, email, date FROM users WHERE user_id = $1',
      [req.id]
    )
    res.send(data.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
})
module.exports = router
