var express = require("express");
var path    = require("path");
var app     = express();

var server = require('http').Server(app);

require("./websockets")(server);

module.exports = server;

// Setup jade views

app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

// Common middleware

app.use(require("./middlewares/logging"));
app.use(express.static("public"));
app.use(require("./middlewares/forms"));
app.use(require("./middlewares/session"));

// Routes

app.use(require("./routes/chat"));

// Root path

app.get("/", function(req, res) { res.render("index"); });

