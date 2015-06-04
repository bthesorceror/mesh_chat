var client = require("socket.io-client");
var $      = require("jquery");

var SessionDescription = require("./session_description");
var PeerConnection     = require("./peer_connection");
var IceCandidate       = window.mozRTCIceCandidate || window.RTCIceCandidate;

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

var connections = require("./connections");

function onError(err) {
  console.error(err);
}

function onJoin(connection, name) {
  addUser(name);

  var pc      = new PeerConnection(peerConfig, peerOptions);
  var channel = pc.createDataChannel("mesh_chat");

  registerIceEvent(pc, connection, name);
  registerChannel(pc, channel, name);

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
  connections.remove(name);
}

function registerIceEvent(pc, connection, name) {
  pc.onicecandidate = function(event) {
    connection.emit("candidate", name, event.candidate);
  }
}

function registerChannel(pc, channel, name) {
  channel.onopen = function(ev) {
    showOnline(name);
    pc.channel = channel;
  }

  channel.onclose = function(ev) {
    showOffline(name);
    pc.channel = null;
  }

  channel.onmessage = function(ev) {
    addMessage(name, ev.data);
  }
}

function onRequest(connection, name, offer) {
  var pc = new PeerConnection(peerConfig, peerOptions);

  registerIceEvent(pc, connection, name);

  pc.ondatachannel = function(ev) {
    var channel = ev.channel;
    registerChannel(pc, channel, name);
  };

  connections.add(name, pc);

  pc.setRemoteDescription(new SessionDescription(offer), function() {
    pc.createAnswer(function(answer) {
      pc.setLocalDescription(answer, function() {
        connection.emit("answer", name, answer);
      }, onError);
    }, onError);
  }, onError);
}

function onAnswer(connection, name, answer) {
  var pc = connections.get(name);

  if (!pc) return;

  var desc = new SessionDescription(answer);
  pc.setRemoteDescription(desc, function() {}, onError);
}

function onCandidate(name, candidate) {
  var pc = connections.get(name);
  if (!pc) return;

  if (!candidate) return;

  var iceCandidate = new IceCandidate(candidate);
  pc.addIceCandidate(iceCandidate);

}

function addMessage(name, message) {
  var $messages = $("#messages");

  var html = "<b>" + name + "</b>: " + message;
  var $msg = $("<div />").addClass("message").html(html);

  $messages.append($msg);
}

function showOnline(name) {
  var $el = findUser(name);

  if (!$el) return;

  $el.removeClass("not_connected");
  $el.addClass("connected");
}

function showOffline(name) {
  var $el = findUser(name);

  if (!$el) return;

  $el.removeClass("connected");
  $el.addClass("not_connected");
}

function connect() {
  var connection = client();

  connection.on("request", onRequest.bind(null, connection))
  connection.on("answer", onAnswer.bind(null, connection))
  connection.on("candidate", onCandidate)
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
  var $el = findUser(name);

  if ($el) $el.remove();
}

function bindForm() {
  var $form = $("form#message");

  $form.on("submit", function(ev) {
    ev.preventDefault();

    var message = $form.find("input[name='message']").val();
    $form[0].reset();

    addMessage("YOU", message);
    connections.broadcast(message);
  });
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
      bindForm();
    }
  })
});
