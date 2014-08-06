var socketio = require('socket.io');
var guestNum = 1, 
    nicknames = {},
    currentRooms = {};
    
    
exports.listen = function(server){
  var io = socketio(server);
  io.on('connection', function (socket) {
    joinRoom('lobby', socket)
    var guestID = guestNum++;
    var nickname = "Guest" + guestID;
    nicknames[socket.id] = nickname
    console.log("new connection!");
  
    socket.emit('from_node_event', { message: 'Hi from node!' });
    // incoming message from 1 user
    socket.on('from_browser_event', function (data) {
      console.log(data);

      // if data.message starts with '/nick' don't broadcast message, change nickname instead
      console.log(data)
      if (data.message[0] === '/') {
        var command = data.message.split(' ')
        switch (command[0]){
        case '/nick':
          var oldName = nickname
          if (changeNickname(socket.id, data)){
            nickname = nicknames[socket.id];
            io.sockets.in(currentRooms[socket.id]).emit('from_node_event', { message: oldName + ' changed nickname to ' + nickname})
          } else {
            socket.emit('from_node_event', { message: "Nickname already taken" });
          }
          break;
        case '/join':
          //  join mother frucking rooms. that right ffrunking
          io.sockets.in(currentRooms[socket.id]).emit('from_node_event', { message: nickname + " has left the room."})
          
          joinRoom(command[1], socket);
          
          
          
          var clients_in_the_room = io.sockets.adapter.rooms[currentRooms[socket.id]]; 
          for (var clientId in clients_in_the_room ) {
            console.log('client: %s', clientId); //Seeing is believing 
            var client_socket = io.sockets.connected[clientId];//Do whatever you want with this
            console.log(nicknames[clientId]);
          }
          
          
          
          io.sockets.in(currentRooms[socket.id]).emit('from_node_event', { message: nickname + " has joined room: " + command[1] });
          break;
        }

      } else {
      
        data.message = nickname + ": " + data.message;
        // broadcast that mesasge to everyone connected
        io.sockets.in(currentRooms[socket.id]).emit('from_node_event', { message: data.message });    
      }

    });
  });
}


var changeNickname = function(socketid, data) {
  //iterate through nicknames to check if valid etc.  
  var newNickname = data.message.slice(6)
  for (var x in nicknames) {
    if (newNickname === nicknames[x] || newNickname.match('Guest')){
      return false;
    }
  }
  nicknames[socketid] = newNickname;
  return true;
};


var joinRoom = function(room, socket){
  socket.leave(currentRooms[socket.id]);
  socket.join(room);
  currentRooms[socket.id] = room; 
}
