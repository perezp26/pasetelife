const {DataTypes} = require('sequelize');
const db = require('../db/config');

const DetallesTicketVenta = db.define('detallesTicketVenta',{
    idDetalleTicketVenta: {
        type: DataTypes.STRING,
        primaryKey: true,
        autoIncrement : true
    },
    idTicketVenta: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idEntradaProducto : {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    idDetalleEntradaProducto: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fechaTicketVenta : {
        type : DataTypes.TIME, 
        allowNull : false,
    },
    idProducto:{
        type: DataTypes.INTEGER,
        allowNull : false,
    },
    cantidad: {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    precioVenta : {
        type : DataTypes.DECIMAL, 
        allowNull : false,
    },
    totalPrecioVenta:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    idSucursal:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status:{
        type: DataTypes.CHAR,
        allowNull: false
    },
},{
    timestamps: false,
    tableName : 'detallesTicketVenta'
});

module.exports =  DetallesTicketVenta; 