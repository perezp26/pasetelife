const {DataTypes} = require('sequelize');
const db = require('../db/config');

const EntradaProducto = db.define('entradasProducto',{
    idEntradaProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    fechaEntradaProducto : {
        type : DataTypes.DATEONLY,
        allowNull : false,
    },
    descripcion : {
        type : DataTypes.STRING,
    },
    costoTotalEntradaProducto : {
        type : DataTypes.DECIMAL, 
        allowNull : false,
    },
    idSucursal:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    porAjuste: {
        type : DataTypes.CHAR,
        allowNull: false
    },
    status:{
        type : DataTypes.CHAR,
        allowNull: false
    }

},{
    timestamps: false,
    tableName : 'entradasProducto'
});

module.exports =  EntradaProducto; 