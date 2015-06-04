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

var connections = require("./connections");

function onError(err) {
  console.error(err);
}

function onJoin(connection, name) {
  addUser(name);

  var pc      = new PeerConnection(peerConfig, peerOptions);
  var channel = pc.createDataChannel("mesh_chat");

  pc.onicecandidate = function(event) {
    connection.emit("candidate", name, event.candidate);
  }

  channel.onopen = function(ev) {
    showOnline(name);
    pc.channel = channel;
  }

  channel.onclose = function(ev) {
    pc.channel = null;
  }

  channel.onmessage = function(ev) {
    console.log(name, "sent", ev.data);
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
  var pc = new PeerConnection(peerConfig, peerOptions);

  pc.onicecandidate = function(event) {
    connection.emit("candidate", name, event.candidate);
  };

  pc.ondatachannel = function(ev) {
    var channel = ev.channel;
    channel.onopen = function(ev) {
      showOnline(name);
      pc.channel = channel;
    }

    channel.onclose = function(ev) {
      pc.channel = null;
    }

    channel.onmessage = function(ev) {
      showOffline(name);
      console.log(name, "sent", ev.data);
    }
  };

  connections[name] = pc;

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

  var iceCandidate = new RTCIceCandidate(candidate);
  pc.addIceCandidate(iceCandidate);

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
