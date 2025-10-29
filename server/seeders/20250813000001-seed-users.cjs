"use strict";

const { v4: uuidv4 } = require("uuid");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        id: uuidv4(),
        name: "John Doe",
        role: "Requester",
        email: "john.doe@example.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Jane Hughes",
        role: "Requester",
        email: "jane.hughes@example.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "David Hughes",
        role: "Requester",
        email: "david.hughes@example.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Emily Baker",
        role: "Requester",
        email: "emily.baker@example.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: "Manager Bob",
        role: "Validator",
        email: "manager.bob@example.com",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("users", users, { ignoreDuplicates: true });
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete("users", null, { ignoreDuplicates: true });
  },
};
