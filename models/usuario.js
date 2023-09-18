const {DataTypes} = require('sequelize');
const db = require('../db/config');

const Usuario = db.define('usuarios',{
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement : true
    },
    nombre : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    usuario : {
        type : DataTypes.STRING, 
        allowNull : false,
        unique: true
    },
    idPerfil : {
        type: DataTypes.INTEGER,
        allowNull : false,
    },
    password : {
        type : DataTypes.STRING,
        allowNull : false,
    },
    idSucursal : {
        type: DataTypes.INTEGER
    }

},{
    timestamps: false
});

const Perfil = db.define('perfiles',{
    idPerfil : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion : {
        type: DataTypes.STRING,
        allowNull : false
    },
    activo:{
        type: DataTypes.STRING,
    }
},{
    timestamps: false
}) 

const Permiso = db.define('permisos',{
    idPermiso : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idModulo : {
        type: DataTypes.INTEGER,
        allowNull : false,
        },
    descripcion : {
        type: DataTypes.STRING,
        allowNull : false
    },
    activo:{
        type: DataTypes.STRING,
    }
},{
    timestamps: false
})

const Modulo = db.define('modulos',{
    idModulo : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descripcion : {
        type: DataTypes.STRING,
        allowNull : false
    },
    activo:{
        type: DataTypes.STRING,
    }
},{
    timestamps: false
}) 

const PermisosUsuarios = db.define('permisos_usuarios',{
    idpermiso_usuario : {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    idUsuario : {
        type: DataTypes.INTEGER,
        allowNull : false,
    },
    idPermiso : {
        type: DataTypes.INTEGER,
        allowNull : false,
    },
},{
    timestamps: false
}) 
module.exports = {Usuario, Permiso, Modulo, PermisosUsuarios, Perfil}