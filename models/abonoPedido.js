const {DataTypes} = require('sequelize');
const db = require('../db/config');

const AbonoPedido = db.define('abonosPedido',{
    idAbonoPedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    idPedido:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fechaAbono : {
        type : DataTypes.DATEONLY,
        allowNull : false,
    },
    montoAbono:{
        type : DataTypes.DECIMAL,
        allowNull: false
    },
    descripcionAbono:{
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    timestamps: false,
    tableName : 'abonosPedido'
});

module.exports =  AbonoPedido; 