const {DataTypes} = require('sequelize');
const db = require('../db/config');

const DetalleEntradaProducto = db.define('detallesEntradaProducto',{
    idDetalleEntradaProducto: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idEntradaProducto : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    cantidad : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    idProducto : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    fechaEntradaProducto : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    fechaElaboracion : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    maxDiasVenta : {
        type : DataTypes.SMALLINT,
        allowNull : false,
    },
    precioVenta : {
        type : DataTypes.DECIMAL,
        allowNull : false,
    },
    idSucursal : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    fechaRetiro : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    porAjuste : {
        type : DataTypes.CHAR,
        allowNull : false,
    },
    totalSalidas : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },

},{
    timestamps: false,
    tableName : 'detallesEntradaProducto'
});

module.exports =  DetalleEntradaProducto; 