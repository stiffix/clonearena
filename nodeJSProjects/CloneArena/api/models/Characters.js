/**
 * Characters.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autoCreatedAt: false,
    autoUpdatedAt: false,

  attributes: {
      score_id: {
          type: 'int',
          required: true
      },
      wallet: {
          type: 'int',
          required: true
      },
      body_item: {
          type: 'int'
      },
      weapon_item: {
          type: 'int'
      }
  }
};

