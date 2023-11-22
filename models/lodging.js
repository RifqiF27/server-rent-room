'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lodging extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Lodging.belongsTo(models.Type, { foreignKey: "typeId" })
      Lodging.belongsTo(models.User, { foreignKey: "authorId" })
      Lodging.hasMany(models.Bookmark, { foreignKey: "LodgingId" })
    }
  }
  Lodging.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'name cannot be empty'
        },
        notNull: {
          msg: 'name cannot be empty'
        }
      }
    },
    facility: {
      type: DataTypes.TEXT, 
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'facility cannot be empty'
        },
        notNull: {
          msg: 'facility cannot be empty'
        }
      }
    },
    roomCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'roomCapacity cannot be empty'
        },
        notNull: {
          msg: 'roomCapacity cannot be empty'
        }
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'imageUrl cannot be empty'
        },
        notNull: {
          msg: 'imageUrl cannot be empty'
        }
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'authorId cannot be empty'
        },
        notNull: {
          msg: 'authorId cannot be empty'
        }
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'location cannot be empty'
        },
        notNull: {
          msg: 'location cannot be empty'
        }
      }
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'price cannot be empty'
        },
        notNull: {
          msg: 'price cannot be empty'
        }
      }
    },
    typeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'typeId cannot be empty'
        },
        notNull: {
          msg: 'typeId cannot be empty'
        }
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'status cannot be empty'
        },
        notNull: {
          msg: 'status cannot be empty'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Lodging',
  });
  return Lodging;
};