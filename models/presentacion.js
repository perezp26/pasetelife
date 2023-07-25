const { DataTypes } = require('sequelize');
const db = require('../db/config');

const Presentacion = db.define('presentaciones',{
    idPresentacion: {
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
    tableName : 'presentaciones'
});

module.exports =  Presentacion; 