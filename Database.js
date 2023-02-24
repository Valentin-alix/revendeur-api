"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUser = exports.getUserByEmailAndUniqKey = exports.getAllUsers = void 0;
var sqlite3 = require("sqlite3").verbose();
// Ouverture de la base de données
var db = new sqlite3.Database('mydb.db');
// Création de la table "user"
db.run("\n  CREATE TABLE IF NOT EXISTS user (\n    id INTEGER PRIMARY KEY,\n    email TEXT UNIQUE NOT NULL,\n    uniq_key TEXT NOT NULL\n  )\n");
// Fonction pour requêter tous les utilisateurs
var getAllUsers = function () {
    return new Promise(function (resolve, reject) {
        db.all('SELECT * FROM user', function (err, rows) {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
};
exports.getAllUsers = getAllUsers;
// Fonction pour récupérer un utilisateur par son email et sa clé unique
var getUserByEmailAndUniqKey = function (email, uniq_key) {
    return new Promise(function (resolve, reject) {
        db.get('SELECT * FROM user WHERE email = ? AND uniq_key = ?', [email, uniq_key], function (err, row) {
            if (err) {
                reject(err);
            }
            else if (!row) {
                resolve(undefined);
            }
            else {
                resolve(row);
            }
        });
    });
};
exports.getUserByEmailAndUniqKey = getUserByEmailAndUniqKey;
var addUser = function (email, uniq_key) {
    return new Promise(function (resolve, reject) {
        db.run('INSERT INTO user (email, uniq_key) VALUES (?, ?)', [email, uniq_key], function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(this.lastID);
            }
        });
    });
};
exports.addUser = addUser;
var email = 'didier.dupont@gmail.com';
var uniq_key = '1253565489799868674546747563';
// Adding atleast one user for testing purpose
(0, exports.getUserByEmailAndUniqKey)(email, uniq_key).then(function (user) {
    if (!user) {
        (0, exports.addUser)(email, uniq_key)
            .then(function (userId) {
            console.log("User ".concat(email, " successfuly added"));
        })
            .catch(function (err) {
            console.log('User can\'t be added : ' + err);
        });
    }
    else {
        console.log("User ".concat(email, " already exists, no need to add"));
    }
}).catch(function (err) {
    console.log('User can\'t be added : ' + err);
});
