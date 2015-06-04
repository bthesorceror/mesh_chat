var express = require("express");
var app = express();

var users = require("../models/users");

module.exports = app;

function requireName(req, res, next) {
  if (!req.session.name) {
    return res.status(403).json({
      error: "Must have username."
    });
  }
  next();
}

app.get("/users", requireName, function(req, res) {
  users.list(function(err, list) {
    res.status(200).json({
      users: list
    });
  });
});
