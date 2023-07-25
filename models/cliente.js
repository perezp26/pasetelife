const {DataTypes} = require('sequelize');
const db = require('../db/config');

const Cliente = db.define('clientes',{
    idCliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    nombre : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    direccion : {
        type : DataTypes.STRING, 
    },
    codigoPostal : {
        type: DataTypes.INTEGER,
    },
    telefono : {
        type : DataTypes.STRING,
    },
    fechaNacimiento:{
        type: DataTypes.DATEONLY
    },
    movil : {
        type: DataTypes.STRING
    },
    rfc:{
        type: DataTypes.STRING
    },
    mail:{
        type: DataTypes.STRING
    },
    status:{
        type:DataTypes.CHAR
    }

},{
    timestamps: false
});

module.exports =  Cliente; 