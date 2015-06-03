var express = require("express");
var app     = express();
var users   = require("../models/users");

module.exports = app;

function requireName(req, res, next) {
  if (!req.session.name) {
    return res.redirect("/");
  }
  next();
}

function validateName(name, cb) {
  if (!name) return cb("Must provide a name.");

  users.get(name, function(err, user) {
    if (err) return cb("Failed to lookup name");
    if (user) return cb("Name already in use");

    cb();
  });
}

app.get("/chat", requireName, function(req, res) {
  var name = req.session.name;
  res.render("chat", {name: name});
});

app.post("/start", function(req, res) {
  var name = req.fields.name;

  validateName(name, function(err) {

    if (err) {
      res.render("index", { name_error: err });
      return
    }

    req.session.name = name;
    res.redirect("/chat");

  });

});
