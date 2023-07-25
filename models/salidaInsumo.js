const {DataTypes} = require('sequelize');
const db = require('../db/config');

const SalidaInsumo = db.define('salidasInsumos',{
    idSalidaInsumo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    fechaSalidaInsumo : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    observaciones : {
        type : DataTypes.STRING,
    },
    porAjuste : {
        type : DataTypes.CHAR, 
        allowNull : false,
    },
    idSucursal: {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    status:{
        type: DataTypes.CHAR,
        allowNull: false
    }

},{
    timestamps: false,
    tableName : 'salidasInsumos'
});

module.exports =  SalidaInsumo; 