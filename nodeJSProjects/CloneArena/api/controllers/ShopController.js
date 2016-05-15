/**
 * ShopController
 *
 * @description :: Server-side logic for managing shops
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	store: function(req, res) {
        
        // Fetch/Refresh character
        Characters.findOne({id:req.session.user.character_id}, function(err, chrctr) {
            if (err) return next(err);
            if (chrctr) {
                req.session.character = chrctr;
                Item.query('SELECT Shop.id, Item.id AS iid, Item.name, Item.price, Item.img FROM Shop INNER JOIN Item ON Shop.item_id = Item.id', function(err, results) {
                    if (err) res.serverError(err);
                    res.view({itemlist: results, page: req.url});
                });
            }
        });
        
        
    },
    customization: function(req, res, next) {
        
        if (req.session.character) {
            Score.findOne({id: req.session.character.id}, function(err, score) {
                if (err) next(err);
                
                // Fetch inventory of character body_items
                Item.query('SELECT Item.name, Item.img, Item.type, Inventory.id FROM Item INNER JOIN Inventory ON Inventory.item_id = Item.id INNER JOIN Characters ON Characters.id = Inventory.character_id WHERE Item.type = 2 AND Characters.id = ' + req.session.character.id, function(err, body_items) {
                    if (err) next(err);
                    //console.log(body_items);
                    
                    // Fetch inventory of character weapon_items
                    Item.query('SELECT Item.name, Item.img, Item.type, Inventory.id FROM Item INNER JOIN Inventory ON Inventory.item_id = Item.id AND Inventory.character_id = ' + req.session.character.id + ' WHERE Item.type = 1', function(err, weapon_items) {
                        if (err) next(err);
                        //console.log(weapon_items);
                        
                        res.view({scorelist: score, weaponitemlist: weapon_items, bodyitemlist: body_items, page: req.url});
                    });  
                });
            });
        }
    },
    removeItem: function(req, res, next) {
        if (req.session.user && (req.session.user.user_type == 2)) {
            var shop_id = req.param('shopid');
            Shop.query('DELETE FROM Shop WHERE id = ' + shop_id, function(err, result) {
                if (err) return next(err);
                return res.redirect('/shop/store');
            });
        } else {
            // NOT ADMIN
            return res.redirect('/shop/store');
        }
        
    },
    addItem: function(req, res, next) {
        if (req.session.user && (req.session.user.user_type == 2)) {
            var item_to_add = req.param('itemid');
            Shop.query('INSERT INTO Shop (item_id) VALUES (' + item_to_add + ')', function(err, result) {
                if (err) return next(err);
                return res.redirect('/shop/store');
            });
        } else {
            // NOT ADMIN
            return res.redirect('/shop/store');
        }
    },
    itemlist: function(req, res, next) {
        if (req.session.user && (req.session.user.user_type == 2)) {
            Shop.query('SELECT Item.id, Item.name, Item.price, Item.img, Item.type FROM Item WHERE Item.id NOT IN (SELECT Shop.item_id FROM Shop)', function(err, result) {
                if (err) return next(err);
                return res.view({page: req.url, shopitemlist: result});
            });
        } else {
            // NOT ADMIN
            return res.redirect('/shop/store');
        }
    },
    buyItem: function(req, res, next) {
        if (req.session.user) {
            var buyid = req.param('buyid');
            var buycost = req.param('buycost');
            if ((req.session.character.wallet - buycost) < 0) {
                    req.session.message = 'You do NOT have enough coins!';
                    req.session.message_page = '/shop/store';
                    return res.redirect('/shop/store');
            }
            Inventory.findOne({item_id: buyid, character_id: req.session.character.id}, function foundItem(err, fitem) {
                if (err) return next(err);
                if (fitem == undefined) {
                    // Can buy
                    Inventory.query('INSERT INTO Inventory (character_id, item_id) VALUES (' + req.session.character.id + ', ' + buyid + ')', function(err, result) {
                        // Bought --Wallet
                        Characters.query('UPDATE Characters, Item SET Characters.wallet = Characters.wallet - Item.price WHERE Item.id = ' + buyid + ' AND Characters.id = ' + req.session.character.id, function(err, result) {
                            if (err) return next(err);
                            
                            return res.redirect('/shop/store');  
                        });
                    });
                } else {
                    req.session.message = 'You already have this item!';
                    req.session.message_page = '/shop/store';
                    return res.redirect('/shop/store');
                }
            });
            
            
            
        } else {
            return res.redirect('/user/signup');
        }
    },
    editprice: function(req, res, next) {
        if (req.session.user) {
            var newprice = req.param('newprice');
            var itemid = req.param('itemid');
            Item.query('UPDATE Item SET Item.price = ' + newprice + ' WHERE Item.id = ' + itemid, function(err, result) {
                if (err) return next(err);
                return res.redirect('/shop/store');
            });
        } else {
            // Error
            return res.redirect('/');
        }
    }
};

