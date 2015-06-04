var async  = require("async");
var client = require("socket.io-client");
var $      = require("jquery");

function onJoin(name) {
  addUser(name);
}

function onPart(name) {
  removeUser(name);
}

function connect() {
  var connection = client();

  connection.on("join", onJoin);
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
