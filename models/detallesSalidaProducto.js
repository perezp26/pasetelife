const {DataTypes} = require('sequelize');
const db = require('../db/config');

const DetalleSalidaProducto = db.define('detallesSalidaProducto',{
    idDetalleSalidaProducto: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idSalidaProducto : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    idDetalleEntradaProducto : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    idEntradaProducto: {
        type: DataTypes.STRING,
    },
    fechaSalidaProducto : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    idProducto : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    cantidad : {
        type : DataTypes.INTEGER,
        allowNull : false,
    },
    precioVenta : {
        type: DataTypes.DECIMAL,
        allowNull : false
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
    tableName : 'detallesSalidaProducto'
});

module.exports =  DetalleSalidaProducto; 