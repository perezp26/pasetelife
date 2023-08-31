const { DataTypes } = require('sequelize');
const db = require('../db/config');

const Producto = db.define('productos',{
    idProducto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    codigoProducto:{
        type: DataTypes.STRING,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type:DataTypes.STRING
    },
    idTipoCategoria: {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
    idTipoRelleno: {
        type:DataTypes.INTEGER,
    },
    idTipoCubierta: {
        type:DataTypes.INTEGER,
    },
    numPersonas: {
        type:DataTypes.INTEGER,
        allowNull : false,
    },
    inventariable: {
        type:DataTypes.CHAR,
        allowNull : false,
    },
    precioVentaMulsay:{
        type:DataTypes.DECIMAL,
    },
    precioVentaConkal:{
        type:DataTypes.DECIMAL,
    },
    activo: {
        type: DataTypes.CHAR,
        allowNull : false,
    }
},{
    timestamps: false,
    tableName : 'productos'
});

module.exports =  Producto; 