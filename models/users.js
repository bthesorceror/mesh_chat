var store = {};

var users = {

  get: function(name, done) {
    var value = store[name];
    done(null, value);
  },

  add: function(name, done) {
    store[name] = true;
    done();
  },

  remove: function(name, done) {
    delete store[name];
    done();
  },

  list: function (done) {
    var results = Object.keys(store);
    done(null, results);
  },

  clear: function (done) {
    console.info("clearing user presence...");
    store = {};
    done();
  }

}

module.exports = users;
