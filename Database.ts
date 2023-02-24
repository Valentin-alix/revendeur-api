const sqlite3 = require("sqlite3").verbose();
import { RunResult } from 'sqlite3';

// Ouverture de la base de données
const db = new sqlite3.Database('mydb.db');

// Création de la table "user"
db.run(`
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    uniq_key TEXT NOT NULL
  )
`);

// db.run(`
//   DROP TABLE IF EXISTS user
// `);

interface User {
  email: string;
  uniq_key: string;
}

// Fonction pour requêter tous les utilisateurs
export const getAllUsers = (): Promise<{ id: number; email: string; uniq_key: string }[]> =>
  new Promise((resolve, reject) => {
    db.all('SELECT * FROM user', (err: any, rows: { id: number; email: string; uniq_key: string; }[] | PromiseLike<{ id: number; email: string; uniq_key: string; }[]>) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

// Fonction pour récupérer un utilisateur par son email et sa clé unique
export const getUserByEmailAndUniqKey = (email: string, uniq_key: string): Promise<User | undefined> =>
  new Promise((resolve, reject) => {
    db.get('SELECT * FROM user WHERE email = ? AND uniq_key = ?', [email, uniq_key], (err: Error | null, row: User) => {
      if (err) {
        reject(err);
      } else if (!row) {
        resolve(undefined);
      } else {
        resolve(row);
      }
    });
  });

export const addUser = (email: string, uniq_key: string): Promise<number> =>
  new Promise((resolve, reject) => {
    db.run('INSERT INTO user (email, uniq_key) VALUES (?, ?)', [email, uniq_key], function (this: RunResult, err: Error) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });

const email = 'didier.dupont@gmail.com';
const uniq_key = '1253565489799868674546747563';

// Adding atleast one user for testing purpose
getUserByEmailAndUniqKey(email, uniq_key).then((user) => {
  if (!user) {
    addUser(email, uniq_key)
      .then((userId) => {
        console.log(`User ${email} successfuly added`);
      })
      .catch((err) => {
        console.log('User can\'t be added : ' + err);
      });
  } else {
    console.log(`User ${email} already exists, no need to add`)
  }
}).catch((err) => {
  console.log('User can\'t be added : ' + err);
});