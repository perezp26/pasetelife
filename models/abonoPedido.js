const {DataTypes} = require('sequelize');
const db = require('../db/config');

const AbonoPedido = db.define('abonosPedido',{
    idAbonoPedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    idSucursal:{
        type: DataTypes.INTEGER
    },
    idPedido:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fechaAbono : {
        type : DataTypes.TIME,
        allowNull : false,
    },
    formaPago:{
        type : DataTypes.CHAR,
    },
    montoAbono:{
        type : DataTypes.DECIMAL,
        allowNull: false
    },
    descripcionAbono:{
        type: DataTypes.STRING,
        allowNull: false
    },
    idUsuario:{
        type: DataTypes.INTEGER
    },
    idControlAperturaCierreCaja:{
        type: DataTypes.INTEGER
    }
},
{
    timestamps: false,
    tableName : 'abonosPedido'
});

module.exports =  AbonoPedido; 