var store = {};

var users = {

  get: function(name, done) {
    var value = store[name];
    setImmediate(function() {
      done(null, value);
    });
  },

  add: function(name, done) {
    store[name] = true;
    setImmediate(function() {
      done();
    });
  },

  remove: function(name, done) {
    delete store[name];
    setImmediate(function() {
      done();
    });
  },

  list: function (done) {
    var results = Object.keys(store);
    setImmediate(function() {
      done(null, results);
    });
  },

  clear: function (done) {
    store = {};
    setImmediate(function() {
      done();
    });
  }

}

module.exports = users;
