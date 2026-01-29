const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lead = sequelize.define(
    'Lead',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM(
          'new',
          'contacted',
          'qualified',
          'converted',
          'lost'
        ),
        defaultValue: 'new',
      },
      assigned_to: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        field: 'deleted_at',
      },
    },
    {
      tableName: 'leads',
      timestamps: true,
      underscored: true,
      paranoid: true,
      engine: 'InnoDB',
    }
  );

  /**
   * ✅ Associations
   */
  Lead.associate = (models) => {
    // Lead → User (assigned sales user)
    Lead.belongsTo(models.User, {
      foreignKey: 'assigned_to',
      as: 'assignedUser',
    });

    // Lead → LeadActivity (timeline)
    Lead.hasMany(models.LeadActivity, {
      foreignKey: 'lead_id',
      as: 'activities',
    });
  };

  return Lead;
};
