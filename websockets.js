var users = require("./models/users");

function onConnection(io, socket) {
  var screenName = socket.session.name;

  console.info("Connected: " + screenName);

  socket.broadcast.emit("join", screenName);
  socket.join(screenName);

  socket.on("request", function(name, offer) {
    io.to(name).emit("request", screenName, offer);
  });

  socket.on("answer", function(name, answer) {
    io.to(name).emit("answer", screenName, answer);
  });

  socket.on("disconnect", function() {
    socket.broadcast.emit("part", screenName);

    users.remove(screenName, function(err) {
      console.info("Disconnected: " + screenName);
    });
  });
}

module.exports = function(app) {
  var io = require("socket.io")(app);

  io.use(require("./middlewares/socket_session"));
  io.use(require("./middlewares/validate_name"));

  io.on("connection", onConnection.bind(null, io));

  return io;
}
