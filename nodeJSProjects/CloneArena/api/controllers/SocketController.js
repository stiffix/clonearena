/**
 * SocketController
 *
 * @description :: Server-side logic for managing sockets
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var totalPlayers = {};

module.exports = {


  /**
   * `SocketController.subscribers()`
   */
  subscribers: function (req, res) {
    //if (!req.param('room')) return res.badRequest('No `room` specified- please specify the name of the room whose subscribers you want to look up.');
    var subscribers = sails.sockets.subscribers('main');
    return res.ok(require('util').format(
      'The "%s" room currently has %d subscribers: ',
      'main',
      subscribers.length,
      subscribers
    ));
  },


  /**
   * `SocketController.id()`
   */
  id: function (req, res) {
    return res.ok('My socket ID is: ' + sails.sockets.id(req.socket));
  },


  /**
   * `SocketController.socketRooms()`
   */
  socketRooms: function (req, res) {
    var rooms = sails.sockets.socketRooms(req.socket);
    return res.ok(require('util').format(
      'My socket is currently subscribed to %d rooms: ',
      rooms.length,
      rooms
    ));
  },

  /**
   * `SocketController.rooms()`
   */
  rooms: function (req, res) {
    var rooms = sails.sockets.rooms();
    return res.ok(require('util').format(
      'There are currently %d rooms: ',
      rooms.length,
      rooms
    ));
  },

  /**
   * `SocketController.join()`
   */
  join: function (req, res) {
    if (totalPlayers.hasOwnProperty(req.session.user.email)) {
        return res.redirect('/');
    }
    //console.log(req.session);  
    sails.sockets.join(req.socket, 'main');  
      console.log("Joining and session keeps: " + req.session.equipped + " for req.session.equipped");
      // Create player
    var tempPlayer = {
        name: req.session.user.email,
        character : {
            head: req.session.character.body_item,
            weapon: req.session.equipped
        },
        equipped: req.session.equipped,
        health : 100,
        kill : 0,
        death : 0
    };

    sails.sockets.broadcast('main', 'newPlayerJoined', {newPlayer: tempPlayer}, req.socket);
    totalPlayers[req.session.user.email] = tempPlayer;
    sails.sockets.broadcast('main', 'receiveAllPlayersStats', {players: totalPlayers});
    
    
    console.log(totalPlayers);
    //totalPlayers.length += 1;
    //return res.ok({myId: req.session.user.email});
    return res.json({myId: req.session.user.email});
  },


  /**
   * `SocketController.leave()`
   */
  leave: function (req, res) {
    if (totalPlayers.hasOwnProperty(req.session.user.email)) {
        delete totalPlayers[req.session.user.email];
    }
    //totalPlayers.length -= 1;
    sails.sockets.leave(req.socket, 'main');
    return res.ok();
  },


  /**
   * `SocketController.broadcast()`
   */
  broadcast: function (req, res) {
      var gotData = req.param('message');
      console.log(req.session);

      if (req.isSocket) {
          //totalPlayers[req.socket.id].health -= 10;
        sails.sockets.broadcast('main', 'meeezage', {message: "<strong> &lt;" + req.session.user.email + "&gt;</strong> " + gotData }, req.socket);
      } else {
          sails.sockets.broadcast('main', 'meeezage', {message: 'Ola!'});
      }
    return res.ok();
  },


  /**
   * `SocketController.emit()`
   */
  emit: function (req, res) {
    //if (!req.param('socketId')) return res.badRequest('No `socketId` specified- please specify the id of the socket you want to emit this data to.');
    //if (!req.param('data')) return res.badRequest('No `data` specified- please specify data to send.');
    sails.sockets.emit('meeezage', {message: 'It Works!'});
    return res.ok();
  },


  /**
   * `SocketController.blast()`
   */
  blast: function (req, res) {
    //if (!req.param('data')) return res.badRequest('No `data` specified- please specify data to send.');
    sails.sockets.blast('meeezage', {message: 'It Works!'});
    return res.ok();
  },
    
    // GAME 
    playerUpdate: function(req, res) {
        var data = { id : req.param('id') };
        data.stats = {};
        data.stats['x'] = req.param('xpos');
        data.stats['y'] = req.param('ypos');
        data.stats['facing'] = req.param('facing');
        data.stats['isMoving'] = req.param('isMoving');
        data.stats['health'] = req.param('health');
        console.log(data);
        
        sails.sockets.broadcast('main', 'onPlayerUpdate', data, req.socket);
    },
    
    attack: function(req, res) {
        sails.sockets.broadcast('main', 'onAttack', req.param('data'), req.socket);    
    }
};

