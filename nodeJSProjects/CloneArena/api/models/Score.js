/**
 * Score.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autoCreatedAt: false,
    autoUpdatedAt: false,

  attributes: {
      kills: {
          type: 'int',
          required: true
      },
      death: {
          type: 'int',
          required: true
      },
      wins: {
          type: 'int',
          required: true
      },
      loss: {
          type: 'int',
          required: true
      }
  }
};

