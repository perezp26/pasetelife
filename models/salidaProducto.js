const {DataTypes} = require('sequelize');
const db = require('../db/config');

const SalidaProducto = db.define('salidasProducto',{
    idSalidaProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    fechaSalidaProducto : {
        type : DataTypes.DATEONLY, 
        allowNull : false,
    },
    descripcion : {
        type : DataTypes.STRING,
    },
    costoTotalSalidaProducto:{
        type: DataTypes.DECIMAL,
    },
    idSucursal: {
        type : DataTypes.INTEGER,
        allowNull: false
    },
    porAjuste : {
        type : DataTypes.CHAR, 
        allowNull : false,
    },
    status:{
        type: DataTypes.CHAR,
        allowNull: false
    }

},{
    timestamps: false,
    tableName : 'salidasProducto'
});

module.exports =  SalidaProducto; 