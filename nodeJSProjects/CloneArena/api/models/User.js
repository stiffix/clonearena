/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	autoCreatedAt: false,
	autoUpdatedAt: false,

  attributes: {
  	email: {
  		type: "string",
  		unique: true,
  		required: true,
  		email: true
  	},
  	password: {
  		type: "string",
  		required: true
  	},
    ban: {
        type: "int"
    },
    user_type: {
        type: "int"
    },
    character_id: {
        type: "int"
    }
      
  }
};

