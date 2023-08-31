const {DataTypes} = require('sequelize');
const db = require('../db/config');

const Pedido = db.define('pedidos',{
    idPedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    fechaPedido : {
        type : DataTypes.DATEONLY,
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