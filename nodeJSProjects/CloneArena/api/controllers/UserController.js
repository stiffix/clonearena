/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	'signup': function(req, res){
        res.view(
            {page: req.url}
        );
    },
    'create': function(req, res, next) {
        // TO DO: Implement password hash
        var hasher = require("password-hash");
        var email = req.param('email');
        var password = req.param('password');
        var confpassword = req.param('confirmpassword');
        if (password != confpassword) {
            req.session.message = 'Passwords do not match!';
            req.session.message_page = '/user/signup';
            req.session.saved_email = email;
            return res.redirect('/user/signup');
        }
        password = hasher.generate(password);

        // Success
        // Create character + score

        var get_score_id = -1;
        var get_character_id = -1;

        Score.query('INSERT INTO Score (kills, death, wins, loss) VALUES (0,0,0,0)', function(err, result) {
            if (err) {
                req.session.message = 'Error occured when creating character (score)!';
                req.session.message_page = '/user/signup';
                return res.redirect('/user/signup');
            }

            //console.log('This is result of score query');
            //console.log(result);
            get_score_id = result.insertId;

            // Create character and bind score_id

            Characters.query('INSERT INTO Characters (score_id, wallet) VALUES (' + get_score_id + ', 100)', function (err, chresult) {
               if (err || (get_score_id == -1)) {
                   req.session.message = 'Error when creating character (character)!';
                   req.session.message_page = '/user/signup';
                   return res.redirect('/user/signup');
               }

                //console.log('This is result of characters query');
                //console.log(chresult);
                get_character_id = chresult.insertId;

                // Create User
                User.create({email: email, password: password, character_id: get_character_id}).exec(function (err, user) {
                    if (err) {
                        req.session.message = 'Email already exists!';
                        req.session.message_page = '/user/signup';
                        req.session.saved_email = email;
                        return res.redirect('/user/signup');
                    }

                    req.session.success_message = 'Your account has been created!';
                    res.redirect('/user/login');

                });     // USER CREATE END

            });     // CHARACTERS QUERY END

        });     // SCORE QUERY END
    },
    'login': function(req, res){
        res.view(
            {page: req.url}
        );
    },
    'auth': function(req, res, next) {
        var email = req.param('email');
        var password = req.param('password');
        User.findOne({email: email}, function foundUser(err, user) {
            var hasher = require("password-hash");
            if (err) return next(err);
            if (user && hasher.verify(password, user.password)) {
                req.session.user = user;
                // Fetch character
                Characters.findOne({id:req.session.user.character_id}, function(err, chrctr) {
                    if (err) return next(err);
                    if (chrctr) {
                        req.session.character = chrctr;
                        Item.query("SELECT Item.id, Item.name FROM Item INNER JOIN Inventory ON Inventory.item_id = Item.id INNER JOIN Characters ON Characters.weapon_item = Inventory.id AND Characters.id = " + req.session.user.character_id + " WHERE Characters.weapon_item = " + req.session.character.weapon_item, function(err, weapon) {
                                if (err) return next(err);
                                console.log("...............__:_:_:_:::::.....");
                                console.log(weapon[0]);
                                if (weapon[0] !== undefined) {
                                    req.session.equipped = weapon[0].id;
                                    console.log(req.session);
                                    return res.redirect('/');
                                } else {
                                    return res.redirect('/');
                                }
                                
                            });
                        
                    }
                });
            } else {
                req.session.message = 'Your email or password is incorrect!';
                req.session.message_page = '/user/login';
                return res.redirect('/user/login');
            }
            
        });
    },
    'logout': function(req, res, next) {
        req.session.destroy();
        res.redirect('/');
    },
    'management': function(req, res, next) {
        User.query("SELECT User.id, User.email, User.user_type, User.ban FROM User WHERE User.email != '" + req.session.user.email + "'", function(err, usrlist) {
            if (err) next(err);
            res.view({users_data: usrlist, page: req.url});
        });
        
    },
    'blockUser': function(req, res, next) {
        var id = req.param('id');
        var blockstate = req.param('blockstate');
        console.log(id);
        User.query('UPDATE User SET ban = ' + blockstate + ' WHERE id = ' + id, function(err, usr) {
            if (err) {
                req.session.message = 'Cannot block this user!';
                req.session.message_page = '/user/management';
                return res.redirect('/user/management');
            }
            return res.redirect('/user/management');
        });
        
    },
    'removeUser': function(req, res, next) {
        var id = req.param('id');
        User.query('DELETE User, Characters, Score, Inventory FROM User JOIN Characters ON User.character_id = Characters.id JOIN Score ON Characters.score_id = Score.id LEFT JOIN Inventory ON Characters.id = Inventory.character_id  WHERE User.id = ' + id, function(err, usr) {
            if (err) {
                req.session.message = 'Cannot remove this user!';
                req.session.message_page = '/user/management';
                return res.redirect('/user/management');
            }
            return res.redirect('/user/management');
        });
        
    }
};

