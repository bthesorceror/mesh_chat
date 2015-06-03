var session = require("express-session");

var middleware = session({
  secret: "My wild secret",
  resave: false,
  saveUninitialized: true
});

module.exports = middleware;
