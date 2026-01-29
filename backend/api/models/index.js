// models/index.js

const sequelize = require('../common/database');

const defineUser = require('./user');
const defineLead = require('./leads');
const defineLeadActivity = require('./leadActivity');

const User = defineUser(sequelize);
const Lead = defineLead(sequelize);
const LeadActivity = defineLeadActivity(sequelize);

const models = {
  User,
  Lead,
  LeadActivity,
};

/**
 * Call associate if exists (future-proof)
 */
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  User,
  Lead,
  LeadActivity,
};
