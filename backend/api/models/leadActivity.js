const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LeadActivity = sequelize.define(
    'LeadActivity',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      lead_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      activity_type: {
        type: DataTypes.STRING,
        allowNull: false, // status_change, note, call, email
      },
      description: {
        type: DataTypes.TEXT,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at',
      },
    },
    {
      tableName: 'lead_activities',
      timestamps: true,
      underscored: true,
      paranoid: true,
      engine: 'InnoDB',
    }
  );

  LeadActivity.associate = (models) => {
    LeadActivity.belongsTo(models.Lead, {
      foreignKey: 'lead_id',
      as: 'lead',
    });

    LeadActivity.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'createdBy',
    });
  };

  return LeadActivity;
};
