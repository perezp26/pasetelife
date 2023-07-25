const { DataTypes } = require('sequelize');
const db = require('../db/config');

const Sucursal = db.define('sucursales',{
    idSucursal: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activa: {
        type: DataTypes.CHAR,
        allowNull: false
    },
    direccion: {
        type:DataTypes.STRING
    },
    telefono: {
        type:DataTypes.STRING
    },
    mail: {
        type:DataTypes.STRING
    }
},{
    timestamps: false,
    tableName : 'sucursales'
});

module.exports =  Sucursal; 