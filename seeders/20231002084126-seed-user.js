'use strict';
const fs = require('fs');
const { hasPassword } = require('../helpers/bcrypt');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    const user = JSON.parse(fs.readFileSync('./data/user.json', 'utf-8')).map((el) =>{
      el.password = hasPassword(el.password)
      el.createdAt = el.updatedAt = new Date()
      return el
     })
    //  console.log(user);
     await queryInterface.bulkInsert('Users',user);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {});
  }
};
