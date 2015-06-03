var client = require("socket.io-client");

var connection = client();

connection.on("join", function(name) {
  console.dir(name);
});
