var users = require("../models/users");

module.exports = function(socket, next) {
  var name = socket.session.name;
  if (!name) return next("screen name is required");

  users.get(name, function(err, inUse) {
    if (err) return next(err);
    if (inUse) return next("name already in use.");

    users.add(name, function(err) {
      if (err) return next(err);

      next();
    });
  });
}
