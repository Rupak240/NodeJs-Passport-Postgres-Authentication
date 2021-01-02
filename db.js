require("dotenv").config();
// const { Pool } = require("pg");
const { Sequelize } = require("sequelize");

// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// const pool = new Pool({ connectionString });

// module.exports = { pool };

const sequelize = new Sequelize(
  `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
);

sequelize
  .authenticate()
  .then(() => console.log("Connected to Database :: Postgres"))
  .catch((error) => console.log("Error connecting to database.", error));

module.exports = sequelize;
