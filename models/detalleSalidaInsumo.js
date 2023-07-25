const {DataTypes} = require('sequelize');
const db = require('../db/config');

const DetalleSalidaInsumo = db.define('detallesSalidaInsumo',{
    idDetalleSalidaInsumo: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idSalidaInsumo : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    idEntradaInsumo : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    idDetalleEntradaInsumo: {
        type: DataTypes.STRING,
    },
    idInsumo : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    fechaSalidaInsumo : {
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
    tableName : 'detallesSalidaInsumo'
});

module.exports =  DetalleSalidaInsumo; 