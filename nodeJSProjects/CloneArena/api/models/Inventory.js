/**
 * Inventory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autoUpdatedAt: false,
    autoCreatedAt: false,

  attributes: {
      character_id: {
          type: 'int',
          required: true
      },
      item_id : {
          type: 'int',
          required: true
      }
  }
};

