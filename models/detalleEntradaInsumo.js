const {DataTypes} = require('sequelize');
const db = require('../db/config');

const DetalleEntradaInsumo = db.define('detallesEntradaInsumo',{
    idDetalleEntradaInsumo: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idEntradaInsumo : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    idInsumo : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    caducidad : {
        type : DataTypes.DATEONLY, 
    },
    fechaEntradaInsumo : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    cantidadPresentacion : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    cantidadUnidad : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    totalCantidad : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    totalCantidadSalida : {
        type : DataTypes.INTEGER,
    },
    costoTotal : {
        type : DataTypes.DECIMAL,
        allowNull : false,
    },
    porAjuste : {
        type : DataTypes.CHAR,
        allowNull : false,
    },
    idSucursal : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },

},{
    timestamps: false,
    tableName : 'detallesEntradaInsumo'
});

module.exports =  DetalleEntradaInsumo; 