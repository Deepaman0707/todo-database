const express = require('express')
require('dotenv').config()
const port = process.env.PG_PORT || 8000
const app = express()
const morgan = require('morgan')
const cors = require('cors')

// middleware

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

// available routes
app.get('/', (req, res) => {
  res.json('HELLO')
})
app.use('/auth', require('./routes/auth'))
app.use('/notes', require('./routes/notes'))

app.listen(port, () => {
  console.log('server is up and listening at PORT', port)
})
