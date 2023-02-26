import { RunResult } from 'sqlite3'
const sqlite3 = require('sqlite3').verbose()

// Ouverture de la base de données
const db = new sqlite3.Database('mydb.db')

// Création de la table "user"
db.run(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    uniq_key TEXT NOT NULL
  )
`)

// db.run(`
//   DROP TABLE IF EXISTS user
// `);

interface User {
  email: string
  uniq_key: string
}

// Fonction pour requêter tous les utilisateurs
export const getAllUsers = async (): Promise<Array<{ id: number, email: string, uniq_key: string }>> =>
  await new Promise((resolve, reject) => {
    db.all('SELECT * FROM user', (err: any, rows: Array<{ id: number, email: string, uniq_key: string }> | PromiseLike<Array<{ id: number, email: string, uniq_key: string }>>) => {
      if (err !== null) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })

// Fonction pour récupérer un utilisateur par son email et sa clé unique
export const getUserByEmailAndUniqKey = async (email: string, uniq_key: string): Promise<User | undefined> =>
  await new Promise((resolve, reject) => {
    db.get('SELECT * FROM user WHERE email = ? AND uniq_key = ?', [email, uniq_key], (err: Error | null, row: User) => {
      if (err != null) {
        reject(err)
      } else if (row == null) {
        resolve(undefined)
      } else {
        resolve(row)
      }
    })
  })

export const addUser = async (email: string, uniq_key: string): Promise<number> =>
  await new Promise((resolve, reject) => {
    db.run('INSERT INTO user (email, uniq_key) VALUES (?, ?)', [email, uniq_key], function (this: RunResult, err: Error) {
      if (err) {
        reject(err)
      } else {
        resolve(this.lastID)
      }
    })
  })

export const removeUser = async (email: string): Promise<number> =>
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM user WHERE email = ?', [email], function (this: RunResult, err: Error) {
      if (err) {
        reject(err)
      } else {
        resolve(this.lastID)
      }
    })
  })

const email = 'didier.dupont@gmail.com'
const uniq_key = '1253565489799868674546747563'

// Adding atleast one user for testing purpose
getUserByEmailAndUniqKey(email, uniq_key).then((user) => {
  if (user == null) {
    addUser(email, uniq_key)
      .then(() => {
        console.log(`User ${email} successfuly added`)
      })
      .catch((err) => {
        console.log(`User can't be added : ${err}`)
      })
  }
}).catch((err) => {
  console.log(`User can't be added : + ${err}`)
})
