function onConnection(socket) {
  var screenName = socket.session.name;

  console.info("Connected: " + screenName);

  socket.broadcast.emit("join", screenName);

  socket.on("disconnect", function() {
    console.info("Disconnected: " + screenName);
  });
}

module.exports = function(app) {
  var io = require("socket.io")(app);

  io.use(require("./middlewares/socket_session"));

  io.use(function(socket, next) {
    if (!socket.session.name) return next("screen name is required");

    next();
  });

  io.on("connection", onConnection);
}
