const { DataTypes } = require('sequelize');
const db = require('../db/config');

const ExistenciaProductoSucursal = db.define('existenciasProductoSucursal',{
    idExistenciaProductoSucursal: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    idSucursal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    entradas: {
        type:DataTypes.INTEGER
    },
    salidas: {
        type:DataTypes.INTEGER
    },
},{
    timestamps: false,
    tableName : 'existenciasProductoSucursal'
});

module.exports =  ExistenciaProductoSucursal; 