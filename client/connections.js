function Connections() {
  this.store = {};
}

Connections.prototype.add = function(name, connection) {
  var current = this.store[name];

  if (current && current.close) {
    current.close();
  }

  this.store[name] = connection;
}

Connections.prototype.get = function(name) {
  return this.store[name];
}

Connections.prototype.broadcast = function(message) {
  var self = this;
  Object.keys(self.store).forEach(function(key) {
    var channel = self.store[key].channel;

    if (!channel) return;

    channel.send(message);
  });
}

module.exports = new Connections();
