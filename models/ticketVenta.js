const {DataTypes} = require('sequelize');
const db = require('../db/config');

const TicketVenta = db.define('ticketsVenta',{
    idTicketVenta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    folio: {
        type: DataTypes.INTEGER,
        //allowNull: false
    },
    fechaTicketVenta : {
        type : DataTypes.TIME, 
        allowNull : false,
    },
    idCliente : {
        type : DataTypes.INTEGER,
    },
    formaPago:{
        type: DataTypes.CHAR,
        allowNull: false
    },
    referencia: {
        type : DataTypes.STRING,
    },
    observaciones : {
        type : DataTypes.STRING, 
    },
    subtotal:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    descuento:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    iva:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    total:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    recibido:{
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    idSucursal:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idUsuario:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    status:{
        type: DataTypes.CHAR,
        allowNull: false
    },
    idControlAperturaCierreCaja:{
        type: DataTypes.INTEGER
    }
},{
    timestamps: false,
    tableName : 'ticketsVenta'
});

module.exports =  TicketVenta; 