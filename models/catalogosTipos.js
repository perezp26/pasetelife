const { DataTypes } = require('sequelize');
const db = require('../db/config');


const tipoCategoria = db.define('tiposCategorias',{
    idTipoCategoria: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activo: {
        type: DataTypes.CHAR,
        allowNull: false
    },
},{
    timestamps: false,
    tableName : 'tiposCategorias'
});

const tipoRelleno = db.define('tiposRellenos',{
    idTipoRelleno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activo: {
        type: DataTypes.CHAR,
        allowNull: false
    },
},{
    timestamps: false,
    tableName : 'tiposRellenos'
});

const tipoCubierta = db.define('tiposCubiertas',{
    idTipoCubierta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    activo: {
        type: DataTypes.CHAR,
        allowNull: false
    },
},{
    timestamps: false,
    tableName : 'tiposCubiertas'
});

module.exports = {tipoCubierta, tipoRelleno, tipoCategoria}