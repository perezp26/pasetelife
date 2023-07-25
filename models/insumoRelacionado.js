const { DataTypes } = require('sequelize');
const db = require('../db/config');

const InsumoRelacionado = db.define('insumosRelacionados',{
    idInsumoRelacionado: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idProducto: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    cantidadInsumo: {
        type:DataTypes.INTEGER,
        allowNull:false
    },
    idInsumo: {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
   
},{
    timestamps: false,
    tableName : 'insumosRelacionados'
});

module.exports =  InsumoRelacionado; 