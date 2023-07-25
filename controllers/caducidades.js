const sequelize = require('sequelize');
const { Op } = require('sequelize');
const { addDays, format } = require('date-fns');
const { utcToZonedTime, toDate } = require('date-fns-tz');
const {DetalleEntradaProducto, Producto, DetalleEntradaInsumo, Insumo, Presentacion, UnidadMedida} = require('../models/indexDb');


const getCaducidadesProducto = async( req, res ) =>{

    try {
        const idSucursal = req.params.idSucursal
        const numDias = req.params.numDias

        const today = addDays(toDate( utcToZonedTime( new Date(), '' )), numDias); 
        const fechaCompara = format(new Date(today),"yyyy-MM-dd").toString()

        const caducidadesProducto =  await DetalleEntradaProducto.findAll({
            where:{  [Op.and] : [
                            { fechaRetiro : { [Op.lte ] : fechaCompara } }, 
                            { idSucursal } ,
                            sequelize.literal('cantidad - totalSalidas > 0')
                    ]},
            include:[
                {
                    model: Producto,
                    attributes:[ 'codigoProducto','nombre', 'numPersonas' ]
                }
            ],
            order:['fechaRetiro']
        })

        res.status(200).json({
            ok: true,
            caducidadesProducto,
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'no se puedo obtener las caducidades de los productos' ,
        })
    }

    

}

const getCaducidadesInsumos = async( req, res ) =>{
    try {

        const idSucursal = req.params.idSucursal
        const numDias = req.params.numDias

        const today = addDays(toDate( utcToZonedTime( new Date(), '' )), numDias); 
        const fechaCompara = format(new Date(today),"yyyy-MM-dd").toString();

        const caducidadesInsumo = await DetalleEntradaInsumo.findAll({
            where:{[Op.and] : [
                { caducidad : { [Op.lte ] : fechaCompara } }, 
                { idSucursal } ,
                sequelize.literal('totalCantidad - totalCantidadSalida > 0')
            ]},
            attributes:['idDetalleEntradaInsumo',
                        'idEntradaInsumo',
                        'idInsumo',
                        'caducidad',
                        'fechaEntradaInsumo',
                        [sequelize.literal('TRUNCATE( ((totalCantidad - totalCantidadSalida)/insumo.contenido) , 0)'),'existenciaPresentacion'],
                        [sequelize.literal('totalCantidad - (TRUNCATE( ((totalCantidad - totalCantidadSalida)/insumo.contenido) , 0) * insumo.contenido) '),'existenciaUnidadMedida'],
                        [sequelize.literal('totalCantidad - totalCantidadSalida'), 'existenciaTotal'],
                        'idSucursal',
                    ],
                    include:[{
                        model:Insumo,
                        attributes:['nombre','contenido',],
                        include:[
                            {
                                model:Presentacion, as:'presentacion'
                            },
                            {
                                model:UnidadMedida, as:'unidadMedida'
                            },
                        ]
                }],
                order:['caducidad']
        })
        
        res.status(200).json({
            ok: true,
            caducidadesInsumo,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'no se pudo obtener las caducidades de los insumos' ,
        })
    }
}

module.exports={
    getCaducidadesProducto,
    getCaducidadesInsumos
}