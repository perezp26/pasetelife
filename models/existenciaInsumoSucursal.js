const { DataTypes } = require('sequelize');
const db = require('../db/config');

const ExistenciaInsumoSucursal = db.define('existenciasInsumoSucursal',{
    idExistenciaInsumoSucursal: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    idSucursal: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idInsumo: {
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
    tableName : 'existenciasInsumoSucursal'
});

module.exports =  ExistenciaInsumoSucursal; 