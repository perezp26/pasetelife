const {DataTypes} = require('sequelize');
const db = require('../db/config');

const Pedido = db.define('pedidos',{
    idPedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    fechaPedido : {
        type : DataTypes.TIME,
        allowNull : false,
    },
    fechaEntrega : {
        type : DataTypes.DATEONLY,
        allowNull : false,
    },
    idSucursal : {
        type : DataTypes.INTEGER, 
    },
    idCliente:{
        type : DataTypes.INTEGER,
    },
    nombreCliente:{
        type:DataTypes.STRING
    },
    descripcionProducto : {
        type : DataTypes.STRING, 
        allowNull : false,
    },
    numPersonas:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    precio:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    anticipo: {
        type : DataTypes.CHAR,
        allowNull: false
    },
    formaPago:{
        type: DataTypes.CHAR
    },
    montoAnticipo:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    status: {
        type : DataTypes.CHAR,
        allowNull: false
    },
    idUsuario: {
        type:DataTypes.INTEGER
    }

},{
    timestamps: false,
    tableName : 'pedidos'
});

module.exports =  Pedido; 