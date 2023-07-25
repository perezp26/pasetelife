const {DataTypes} = require('sequelize');
const db = require('../db/config');

const EntradaInsumo = db.define('entradasInsumo',{
    idEntradaInsumo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    proveedor : {
        type : DataTypes.STRING,
    },
    descripcion : {
        type : DataTypes.STRING,
    },
    fechaEntradaInsumo : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    porAjuste : {
        type : DataTypes.CHAR, 
        allowNull : false,
    },
    costoTotalEntradaInsumo:{
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    idSucursal: {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    status:{
        type : DataTypes.CHAR,
        allowNull: false
    }

},{
    timestamps: false,
    tableName : 'entradasInsumo'
});

module.exports =  EntradaInsumo; 