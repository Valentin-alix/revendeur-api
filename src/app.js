"use strict";
exports.__esModule = true;
var express = require("express");
var axios_1 = require("axios");
var app = express();
var port = 3000;
var urlMockapi = 'https://615f5fb4f7254d0017068109.mockapi.io/api/v1';
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.get('/*', function (req, res) {
    axios_1["default"].get("".concat(urlMockapi).concat(req.originalUrl))
        .then(function (resp) {
        res.set('Cache-control', 'public, max-age=86400');
        res.json(resp.data);
    })["catch"](function (error) {
        res.status(500);
        res.json(error);
    });
});
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
