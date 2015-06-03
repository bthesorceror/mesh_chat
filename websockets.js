var users = require("./models/users");

function onConnection(socket) {
  var screenName = socket.session.name;

  console.info("Connected: " + screenName);

  socket.broadcast.emit("join", screenName);

  socket.on("disconnect", function() {
    users.remove(screenName, function(err) {
      console.info("Disconnected: " + screenName);
    });
  });
}

module.exports = function(app) {
  var io = require("socket.io")(app);

  io.use(require("./middlewares/socket_session"));
  io.use(require("./middlewares/validate_name"));

  io.on("connection", onConnection);

  return io;
}
