const { DataTypes } = require('sequelize');
const db = require('../db/config');

const Insumo = db.define('insumos',{
    idInsumo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type:DataTypes.STRING
    },
    idPresentacion: {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
    contenido: {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
    idUnidadMedida: {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
    activo: {
        type: DataTypes.CHAR,
        allowNull : false,
    }
},{
    timestamps: false,
    tableName : 'insumos'
});

module.exports =  Insumo; 