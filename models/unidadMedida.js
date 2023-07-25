const { DataTypes } = require('sequelize');
const db = require('../db/config');

const UnidadMedida = db.define('unidadesmedida',{
    idUnidadMedida: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    nombre:{
        type: DataTypes.STRING,
        allowNull: false
    },
    activo:{
        type: DataTypes.CHAR,
        allowNull: false,
    }
},{
    timestamps: false,
    tableName : 'unidadesmedida'
});

module.exports =  UnidadMedida; 