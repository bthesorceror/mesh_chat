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

module.exports = new Connections();
