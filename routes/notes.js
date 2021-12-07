const express = require('express')
const router = express.Router()
const pool = require('../db/db')
const { body, validationResult } = require('express-validator')
const authorization = require('../middleware/authorization')

// Route 1: To fetch notes from the database.

router.get('/fetchnotes', authorization, async (req, res) => {
  try {
    const cards = await pool.query('SELECT * FROM cards WHERE user_id = $1', [
      req.id,
    ])

    res.json(cards.rows)
  } catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
})

// Route 2: To create notes and insert it into database.

router.post(
  '/createnote',
  [
    body('title', 'Enter a title.').exists(),
    body('description', 'Enter a Description.').exists(),
  ],
  authorization,
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() })

      const { title, description, tag } = req.body
      await pool.query(
        'INSERT INTO cards (user_id, title, description, tag, date) values ($1, $2, $3, $4, current_timestamp)',
        [req.id, title, description, tag]
      )

      const cards = await pool.query(
        'SELECT * from cards WHERE card_id = LASTVAL();'
      )

      res.json(cards.rows[0])
    } catch (err) {
      console.error(err.message)
      res.status(500).send(err.message)
    }
  }
)

// Route 3: To update notes into the database.

router.put('/updatenote/:id', authorization, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, tag } = req.body
    await pool.query(
      'UPDATE cards SET title = $1, description = $2, tag = $3, date = current_timestamp WHERE card_id = $4',
      [title, description, tag, id]
    )

    const card = await pool.query('SELECT * from cards WHERE card_id = $1;', [
      id,
    ])

    res.json(card.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
})

// Route 4: To delete notes from the database.

router.delete('/deletenote/:id', authorization, async (req, res) => {
  try {
    const { id } = req.params
    const card = await pool.query('SELECT * from cards WHERE card_id = $1;', [
      id,
    ])

    await pool.query('DELETE FROM cards WHERE card_id = $1', [id])

    res.json(card.rows[0])
  } catch (err) {
    console.error(err.message)
    res.status(500).send(err.message)
  }
})

module.exports = router
