const  { Sequelize  } = require('sequelize');

const db = new Sequelize( process.env.DATABASE, process.env.USER, process.env.PASS ,{
    host: process.env.HOST,
    dialect : process.env.TYPEDATABASE,
    port: process.env.PORT_DB,
    dialectOptions: {
        decimalNumbers: true
      }
} );


module.exports = db