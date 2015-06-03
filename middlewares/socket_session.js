var session = require("./session");

module.exports = function(socket, next) {
  session(socket.request, socket.request.res, function(err) {
    if (err) return next(err);

    socket.session = socket.request.session;
    next();
  });
};
