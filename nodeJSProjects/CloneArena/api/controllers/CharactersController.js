/**
 * CharactersController
 *
 * @description :: Server-side logic for managing characters
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	equipItem : function(req, res, next) {
        if (req.session.user) {
            var inventory_item_id = req.param('invid');
            var item_type = req.param('itemtype');
            console.log('________________');
            console.log(inventory_item_id + "....." + item_type);
            // Weapon
            if (item_type == 1) {
                Characters.query('UPDATE Characters SET weapon_item = ' + inventory_item_id + ' WHERE Characters.id = ' + req.session.character.id, function(err, result) {
                    if (err) return next(err);
                    console.log(result);
                    Characters.findOne({id:req.session.user.character_id}, function(err, chrctr) {
                        if (err) return next(err);
                        if (chrctr) {
                            req.session.character = chrctr;
                            
                            Item.query("SELECT Item.id, Item.name FROM Item INNER JOIN Inventory ON Inventory.item_id = Item.id INNER JOIN Characters ON Characters.weapon_item = Inventory.id AND Characters.id = " + req.session.user.character_id + " WHERE Characters.weapon_item = " + req.session.character.weapon_item, function(err, weapon) {
                                if (err) return next(err);
                                console.log("....._____.....");
                                console.log(weapon[0].id);
                                if (weapon) {
                                    req.session.equipped = weapon[0].id;
                                    console.log(req.session);
                                }
                            });
                            
                            return res.redirect('/shop/customization');
                        }
                    });
                });
            } else if (item_type == 2) {

            }
        } else {
            // ERROR: 
            return res.redirect('/');
        }
    }
};

