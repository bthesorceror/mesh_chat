var async  = require("async");
var client = require("socket.io-client");
var $      = require("jquery");

var SessionDescription = require("./session_description");
var PeerConnection     = require("./peer_connection");

var peerOptions = {
  optional: [
    {DtlsSrtpKeyAgreement: true},
    {RtpDataChannels: true}
  ]
};

var peerConfig = {
  "iceServers": [
    { "url": "stun:stun.l.google.com:19302" }
  ]
};

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

var connections = new Connections();

function onError(err) {
  console.error(err);
}

function onJoin(connection, name) {
  addUser(name);

  var pc      = new PeerConnection(peerConfig, peerOptions);
  var channel = pc.createDataChannel("mesh_chat");

  pc.channel = channel;

  pc.onicecandidate = function(event) {
    connection.emit("candidate", name, event.candidate);
  }

  channel.onopen = function(ev) {
    channel.send("Hello, World!");
  }

  connections.add(name, pc);

  pc.createOffer(
    function(desc){
      pc.setLocalDescription(desc, function() {
        connection.emit("request", name, desc);
      });
    },
    onError
  );
}

function onPart(name) {
  removeUser(name);
}

function onRequest(connection, name, offer) {
  console.dir(name, offer);
}

function connect() {
  var connection = client();

  connection.on("request", onRequest.bind(null, connection))
  connection.on("join", onJoin.bind(null, connection));
  connection.on("part", onPart);
}

function findUser(name) {
  var $userList = $("#user_list");

  var $result;

  $userList.find("div").each(function(idx) {
    var $el = $(this);

    if ($el.text() === name) {
      $result = $el;
    }
  });

  return $result;
}

function removeUser(name) {
  $el = findUser(name);

  if ($el) $el.remove();
}

function addUser(name) {
  var $userList = $("#user_list");
  var $el = $("<div />");

  $el.text(name);
  $el.addClass("not_connected");
  $userList.append($el);
}

function displayList(users) {
  users.forEach(addUser);
}

$(function() {
  $.ajax("/api/users", {
    dataType: "json",
    error: function() {
      console.error("Could not fetch user list.")
    },
    success: function(data) {
      displayList(data.users);
      connect();
    }
  })
});
