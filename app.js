var users   = require("./models/users");
var async   = require("async");
var express = require("express");
var path    = require("path");
var app     = express();

var server = require('http').Server(app);

// export listen function

module.exports = function(port, callback) {
  async.series([
    function(done) {
      users.clear(done);
    },
    function(done) {
      server.listen(port, done);
    }
  ], callback)
}

// Set up socket.io server

require("./websockets")(server);

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
app.use("/api", require("./routes/api"));

// Root path

app.get("/", function(req, res) { res.render("index"); });
