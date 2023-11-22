'use strict';
const {
  Model
} = require('sequelize');
const {hasPassword} = require('../helpers/bcrypt')
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Customer.hasMany(models.Bookmark, {foreignKey:'CustomerId'})
    }
  }
  Customer.init({
    email:{
      type: DataTypes.STRING,
      allowNull: false,
      unique:{
        msg: 'Email already registered'
      },
      validate: {
        notEmpty: {
          msg: 'Email is required'
        },
        notNull: {
          msg: 'Email is required'
        },
        isEmail: {
          msg: 'Email format is invalid'
        },
      }
    },
    password: {
      type : DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Password is required"
        },
        notEmpty: {
          msg: "Password is required"
        },
        len:{
          args: 8,
          msg: "Password min 8 character"
        },
      }
    },
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Customer',
  });
  Customer.beforeCreate((customer) => {
    customer.password = hasPassword(customer.password)
    customer.role = "Staff"
  })
  return Customer;
};