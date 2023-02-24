"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("../Database");
var Database_1 = require("../Database");
require('dotenv').config();
// Initialisation de l'application Express
var app = (0, express_1.default)();
var bodyParser = require('body-parser');
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
var port = 3000;
var urlMockapi = 'https://615f5fb4f7254d0017068109.mockapi.io/api/v1';
function authenticateToken(req, res, next) {
    var authHeader = req.headers['authorization'];
    var token = authHeader && authHeader.split(' ')[1];
    if (token == null)
        return res.sendStatus(401);
    jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, user) {
        if (err) {
            return res.sendStatus(401);
        }
        req.user = user;
        next();
    });
}
function generateAccessToken(user) {
    return jsonwebtoken_1.default.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1800s' });
}
app.post('/login', function (req, res) {
    // Vérifie que la propriété email existe et n'est pas nulle
    if (!req.body.email) {
        res.status(401).send('Please provide an email');
        return;
    }
    // Vérifie que la propriété password existe et n'est pas nulle
    if (!req.body.uniq_key) {
        res.status(401).send('Please provide a uniq_key');
        return;
    }
    (0, Database_1.getUserByEmailAndUniqKey)(req.body.email, req.body.uniq_key).then(function (user) {
        if (user) {
            var accessToken = generateAccessToken(user);
            res.send({
                accessToken: accessToken,
            });
        }
        else {
            res.status(404).send('User not found');
        }
    }).catch(function (err) {
        res.status(500).send('Authentication problem');
    });
});
app.get('/products/:id?', authenticateToken, function (req, res) {
    var _a;
    axios_1.default.get("".concat(urlMockapi, "/products/").concat((_a = req.params.id) !== null && _a !== void 0 ? _a : ''))
        .then(function (resp) {
        res.set('Cache-control', 'public, max-age=86400');
        res.json(resp.data);
    })
        .catch(function (error) {
        res.status(500);
        res.json(error);
    });
});
app.post('/addUser', authenticateToken, function (req, res) {
    // Vérifie que la propriété email existe et n'est pas nulle
    if (!req.body.email) {
        res.status(401).send('Please provide an email');
        return;
    }
    // Vérifie que la propriété password existe et n'est pas nulle
    if (!req.body.uniq_key) {
        res.status(401).send('Please provide a password');
        return;
    }
    (0, Database_1.addUser)(req.body.email, req.body.uniq_key)
        .then(function (userId) {
        res.status(201).send("User ".concat(req.body.email, " successfuly added"));
    })
        .catch(function (err) {
        res.status(400).send('User can\'t be added : ' + err);
    });
});
app.get('/users', authenticateToken, function (req, res) {
    (0, Database_1.getAllUsers)()
        .then(function (users) {
        res.status(200).send(users);
    })
        .catch(function (err) {
        res.status(400).send('Users can\'t be displayed : ' + err);
    });
});
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
