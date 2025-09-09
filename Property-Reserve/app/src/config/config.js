// solo necesario sin docker-compose env_file, en local descomentar
// require('dotenv').config();


module.exports = {
  development: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DB,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: process.env.DB_DIALECT
  },
  test: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DB,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: process.env.DB_DIALECT
  },
  production: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD || null,
    database: process.env.POSTGRES_DB,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, 
    dialect: process.env.DB_DIALECT
  }
};
