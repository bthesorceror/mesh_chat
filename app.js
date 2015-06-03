var express = require("express");
var path    = require("path");
var app     = express();

app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(require("./middlewares/forms"));
app.use(require("./middlewares/session"));

function requireName(req, res, next) {
  if (!req.session.name) {
    return res.redirect("/");
  }
  next();
}

app.get("/", function(req, res) {
  res.render("index");
});

app.get("/chat", requireName, function(req, res) {
  var name = req.session.name;
  res.render("chat", {name: name});
});

app.post("/start", function(req, res) {
  var name = req.fields.name;

  if (!name) {
    res.render("index", {
      name_error: "Must provide a name."
    });
  } else {
    req.session.name = name;
    res.redirect("/chat");
  }
});

module.exports = app;
