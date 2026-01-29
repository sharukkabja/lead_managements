const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true, 
      autoIncrement: true 
    },
    name: { 
      type: DataTypes.STRING(100), 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING(150), 
      allowNull: true, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING(255), 
      allowNull: true 
    },
    deletedAt: {       
      type: DataTypes.DATE,
      field: 'deleted_at'
    }

  }, { 
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true
  });

   User.associate = (models) => {
    User.hasMany(models.Lead, {
      foreignKey: 'assigned_to',
      as: 'leads',
    });

    User.hasMany(models.LeadActivity, {
      foreignKey: 'created_by',
      as: 'activities',
    });
  };

  return User;
};
