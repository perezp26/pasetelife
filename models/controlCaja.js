const {DataTypes} = require('sequelize');
const db = require('../db/config');

const AperturaCierreCaja = db.define('aperturaCierreCaja',{
    idAperturaCierreCaja: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement : true
    },
    idSucursal: {
        type: DataTypes.SMALLINT,
        allowNull : false,
    },
    idCaja: {
        type: DataTypes.SMALLINT,
        allowNull : false,
    },
    status:{
        type : DataTypes.CHAR
    }
},{
    timestamps: false,
    tableName: 'aperturaCierreCaja'
});

const ControlApeturaCierreCaja = db.define('controlAperturaCierreCaja',{
    idControlAperturaCierreCaja: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement : true
    },
    idSucursal:{
        type: DataTypes.SMALLINT,
        allowNull : false,
    },
    idCaja:{
        type: DataTypes.SMALLINT,
        allowNull : false,
    },
    fechaHoraApertura: {
        type: DataTypes.SMALLINT,
        allowNull : false,
    },
    montoApertura: {
        type: DataTypes.DECIMAL,
        allowNull : false,
    },
    fechaHoraCierre: {
        type: DataTypes.SMALLINT,
    },
    montoCierre: {
        type: DataTypes.DECIMAL,
    },
},{
    timestamps: false,
    tableName: 'controlAperturaCierreCaja'
});



module.exports =  {AperturaCierreCaja, ControlApeturaCierreCaja }; 