import express, { NextFunction } from 'express'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { addUser, getAllUsers, getUserByEmailAndUniqKey } from './Database'

require('dotenv').config()

// Initialisation de l'application Express
const app = express()

const bodyParser = require('body-parser')

// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(bodyParser.json())

const port = 3000
const urlMockapi = 'https://615f5fb4f7254d0017068109.mockapi.io/api/v1'

// Authentication
function authenticateToken (req: any, res: any, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (token == null) return res.sendStatus(401)

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, user: any) => {
    if (err !== null) {
      return res.sendStatus(401)
    }
    req.user = user
    next()
  })
}

function generateAccessToken (user: any): string {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1800s' })
}

// Login to get access token
app.post('/login', (req: any, res: any) => {
  // Vérifie que la propriété email existe et n'est pas nulle
  if (req.body.email === null) {
    res.status(401).send('Please provide an email')
    return
  }

  // Vérifie que la propriété password existe et n'est pas nulle
  if (req.body.uniq_key === null) {
    res.status(401).send('Please provide a uniq_key')
    return
  }

  getUserByEmailAndUniqKey(req.body.email, req.body.uniq_key).then((user) => {
    if (user != null) {
      const accessToken = generateAccessToken(user)
      res.send({
        accessToken
      })
    } else {
      res.status(404).send('User not found')
    }
  }).catch((err) => {
    res.status(500).send(`Authentication problem : ${err}`)
  })
})

// Retrieve products or one product
app.get('/products/:id?', authenticateToken, (req: any, res: any) => {
  axios.get(`${urlMockapi}/products/${req.params.id ?? ''}`)
    .then((resp) => {
      res.set('Cache-control', 'public, max-age=86400')
      res.json(resp.data)
    })
    .catch((error) => {
      res.status(500)
      res.json(error)
    })
})

// Add user in db
app.post('/addUser', authenticateToken, (req: any, res: any) => {
  // Vérifie que la propriété email existe et n'est pas nulle
  if (req.body.email == null) {
    res.status(401).send('Please provide an email')
    return
  }

  // Vérifie que la propriété password existe et n'est pas nulle
  if (req.body.uniq_key == null) {
    res.status(401).send('Please provide a password')
    return
  }
  addUser(req.body.email, req.body.uniq_key)
    .then((userId) => {
      res.status(201).send(`User ${req.body.email} successfuly added`)
    })
    .catch((err) => {
      res.status(400).send(`User can't be added : ' ${err}`)
    })
})

// Display all users
app.get('/users', authenticateToken, (req: any, res: any) => {
  getAllUsers()
    .then((users) => {
      res.status(200).send(users)
    })
    .catch((err) => {
      res.status(400).send(`Users can't be displayed :  ${err}`)
    })
})

export const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
