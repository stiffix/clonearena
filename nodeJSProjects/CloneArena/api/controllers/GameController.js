/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	lobby: function(req, res, next) {
        var socket = req.socket;
        var io = sails.io;
        res.view({layout: 'gamelayout'});
    },
    'join': function(req, res, next) {
        var socket = req.socket;
        
        if (!req.isSocket) {
            console.log('BadRequest');
            return res.badRequest();
        }
        
        
        var lobbyName = 'main';
        sails.sockets.join(req, lobbyName, function(err) {
            console.log('Joining...');
            if (err) return res.serverError(err);
            console.log('Successful');
            //var totalSockets = sails.io.sockets.clients();
            //var socketz = sails.sockets.subscribers();

            //sails.sockets.broadcast(lobbyName, 'joined', req);
        });
        
        sails.sockets.broadcast(lobbyName, 'joined', req);
        console.log('Odoslal');
        return res.send(200);
    },
    'sendMessage': function(req, res, next) {
        sails.sockets.broadcast('main', 'example', req);
        return res.send(200);
    },
    'leave': function(req, res, next) {
        var socket = req.socket;
        var lobbyName = req.param('lobbyName');
        
        socket.leave(lobbyName);
        res.redirect('/');
    }
    
    
    /*,
    'join': function(req, res, next) {
        // Get the ID of the room to join
        var roomId = req.param('roomId');
        // Subscribe the requesting socket to the "message" context, 
        // so it'll get notified whenever Room.message() is called
        // for this room.
        Room.subscribe(req, roomId, ['message']);
        // Continue processing the route, allowing the blueprint
        // to handle adding the user instance to the room's `users`
        // collection.
        return next();
  },
  // Leave a chat room -- this is bound to 'delete /room/:roomId/users'
  'leave': function(req, res, next) {
    // Get the ID of the room to join
    var roomId = req.param('roomId');
    // Unsubscribe the requesting socket from the "message" context
    Room.unsubscribe(req, roomId, ['message']);
    // Continue processing the route, allowing the blueprint
    // to handle removing the user instance from the room's 
    // `users` collection.
    return next();
  }
  
  <input type="hidden" name="buyid" value="<%=item.iid%>" />
    <input type="hidden" name="buycost" value="<%=item.price%>" />
  */
};

