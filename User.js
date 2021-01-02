const Sequelize = require("sequelize");
const db = require("./db");

const UserSchema = db.define(
  "users",
  {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      unique: true,
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Please include a name." },
      },
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Please include a valid email." },
        notEmpty: { msg: "Please include a email." },
      },
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Please include a password." },
      },
    },
  },
  { Sequelize, tableName: "users", modelName: "User" }
);

const createEmptyTables = async () => {
  await UserSchema.sync({ force: true });
};

// createEmptyTables();

module.exports = { User: UserSchema };
