const sequelize = require('sequelize');
const { Op } = require('sequelize');

const db = require('../db/config');
const {Producto, SalidaProducto, DetalleSalidaProducto, ExistenciaProductoSucursal, Sucursal, DetalleEntradaProducto} = require('../models/indexDb');

const getSalidasProducto = async( req, res ) =>{
    try {
        const dateStart = req.params.dateStart;
        const dateEnd = req.params.dateEnd

        const salidasProducto = await SalidaProducto.findAll({
            where : { fechaSalidaProducto : {[Op.between] : [dateStart, dateEnd]} },
            include:[
                {
                    model:Sucursal,
                    as:'sucursal',
                    attributes:['nombre']
                }
            ],
            order:[['idSalidaProducto','DESC']]
        })
        
        res.status(200).json({
            ok: true,
            salidasProducto 
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error consultar las salidas del producto',
            error
        });
    }
}

const getSalidaProducto = async( req, res ) =>{
    
    try {

        const idSalidaProducto = req.params.idSalidaProducto;

        const salidaProducto = await SalidaProducto.findOne({
            where:{ idSalidaProducto },
            include:[
                {
                    model:Sucursal,
                    as:'sucursal',
                    attributes:[
                        ['idSucursal','value'],
                        ['nombre', 'label']
                    ]
                },
                {
                    model:DetalleSalidaProducto,
                    attributes:[
                                'idDetalleSalidaProducto',
                                'idSalidaProducto',
                                'idDetalleEntradaProducto',
                                'idEntradaProducto',
                                'fechaSalidaProducto',
                                'idProducto',
                                'cantidad',
                                'precioVenta',
                                [sequelize.literal('cantidad * detallesSalidaProductos.precioVenta'), 'totalPrecioVenta' ],
                                'porAjuste',
                                'idSucursal'
                    ],
                    include:[
                        {
                            model: Producto,
                            attributes:['codigoProducto','nombre', 'numPersonas']
                        }
                    ]
                }
            ] 
        })

        res.status(200).json({
            ok: true,
            salidaProducto 
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error consultar las salida del producto',
            error
        });
    }

}

const AddNewSalidaProducto = async( req, res ) =>{
    let transaction;
    transaction = await db.transaction();
    try {

        const { dataSalidaProducto, dataDetalleSalidaProducto } = req.body

        const salidaProducto = await SalidaProducto.create({ ...dataSalidaProducto }, { transaction } );

        for( d of dataDetalleSalidaProducto ){
             
            await DetalleSalidaProducto.create({
                            ...d,
                            idSalidaProducto : salidaProducto.idSalidaProducto,
                            fechaSalidaProducto : salidaProducto.fechaSalidaProducto,
                            porAjuste : salidaProducto.porAjuste,
                            idSucursal : salidaProducto.idSucursal
            }, { transaction });

            //--- actualiza la cantidad de salidas en el detalle de la entrada
            const detalleEntradaProducto = await DetalleEntradaProducto.findOne({ 
                    where : { idDetalleEntradaProducto : d.idDetalleEntradaProducto }, transaction
                });
            
            if(!detalleEntradaProducto) {
                await transaction.rollback();
                res.status(500).json({
                ok: false,
                msg: 'no se encontro el detalle de entrada para actualizar',
                })
            }else{
                const suma = detalleEntradaProducto.totalSalidas + d.cantidad;
                await detalleEntradaProducto.update({ totalSalidas : suma }, { transaction });
            }

            // actualiza la existencia en la tabla existencia sucursal producto
            const existenciasSucursal = await ExistenciaProductoSucursal.findOne({
                where:{ idProducto : d.idProducto, idSucursal : salidaProducto.idSucursal }, transaction
            })

            if (!existenciasSucursal) {
                await transaction.rollback();
                res.status(500).json({
                    ok: false,
                    msg: 'no se encontro el producto en las exsitencias de la sucursal',
                })
             } else {
                 await existenciasSucursal.update({ salidas: existenciasSucursal.salidas + d.cantidad }, { transaction })
             }
        }

        await transaction.commit();
         
         res.status(200).json({
             ok: true,
             salidaProducto 
         })
        
    } catch (error) {
        await transaction.rollback();
         res.status(500).json({
             ok: false,
             msg: 'llamar al administrador error al agregar la salida del producto',
             error
         });
    }
}

const updateSalidaProducto = async( req, res ) => {

   let transaction;
   transaction = await db.transaction();

    try {
        const idSalidaProducto = req.params.idSalidaProducto
        const {dataSalidaProducto, dataDetalleSalidaProducto, suprsSalidasDetalleProducto} = req.body
    
        const salidaProducto = await SalidaProducto.findOne({ where: {idSalidaProducto}, transaction });
        if ( !salidaProducto ){
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro esa salida del producto'
            }); 
        }

        delete dataSalidaProducto.idSucursal,
        delete dataSalidaProducto.idSalidaProducto

        const salidaUpdate = await salidaProducto.update( { ...dataSalidaProducto}, { transaction } );

        for( d of dataDetalleSalidaProducto ){

            const data = {
                            ...d,
                            idSalidaProducto: salidaUpdate.idSalidaProducto,
                            fechaSalidaProducto : salidaUpdate.fechaSalidaProducto,
                            porAjuste : salidaUpdate.porAjuste,
                            idSucursal : salidaUpdate.idSucursal
            }
            if( !!data.isNew ) {

                await DetalleSalidaProducto.create({ ...data }, { transaction});

                const detalleEntrada = await DetalleEntradaProducto.findOne({ where:{ idDetalleEntradaProducto : d.idDetalleEntradaProducto }, transaction })
                await detalleEntrada.update({ totalSalidas : detalleEntrada.totalSalidas + data.cantidad }, {transaction});

                //actualizo existenciaSucursal
                const existenciasSucursal = await ExistenciaProductoSucursal.findOne({  where : {idProducto : data.idProducto, idSucursal : data.idSucursal }, transaction });
                await existenciasSucursal.update( { salidas : existenciasSucursal.salidas + data.cantidad }, { transaction});

            }

        }

         //resto los productos borrados
         for( i of suprsSalidasDetalleProducto){
                
            await DetalleSalidaProducto.destroy({ where:{ idDetalleSalidaProducto: i.idDetalleSalidaProducto } ,transaction });

            const detalleEntradaProducto = await DetalleEntradaProducto.findOne({ where:{ idDetalleEntradaproducto : i.idDetalleEntradaProducto} , transaction });
            await detalleEntradaProducto.update({ totalSalidas : detalleEntradaProducto.totalSalidas - i.cantidadSupr},{transaction})

            const existenciaSucursal = await ExistenciaProductoSucursal.findOne({ where:{ idProducto: i.idProducto, idSucursal: i.idSucursal}, transaction});
            await existenciaSucursal.update({ salidas: existenciaSucursal.salidas - i.cantidadSupr }, {transaction});
        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            salidaUpdate 
        })

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al editar la salida del producto',
            error
        })
    }

}

const getExistenciaProducto = async( req, res ) =>{

    try {

        const idSucursal = req.params.idSucursal
        const idProducto = req.params.idProducto
        const eliminadosTemporal = req.body

        const condiciones = []
        for ( const e of eliminadosTemporal ) {
            condiciones.push(sequelize.literal(`idDetalleEntradaProducto = '${ e.idDetalleEntradaProducto }' `));
        }

        const productosExistencia = await DetalleEntradaProducto.findAll(
            { 
                where:{
                    [Op.or]:{
                        [Op.and]:[
                            { idProducto },
                            { idSucursal },
                            sequelize.literal('cantidad - totalSalidas > 0')
                        ],
                        ...condiciones
                    }
                },
                attributes:[
                    'idEntradaProducto','idDetalleEntradaProducto','idProducto','fechaElaboracion',
                    'fechaRetiro', 'precioVenta', 'idSucursal',
                    [sequelize.literal('cantidad - totalSalidas'), 'existencia' ],
                    [sequelize.literal('0'), 'cantidad' ],
                ],
                include:[
                    {
                        model: Producto,
                        attributes:[ 'codigoProducto','nombre','numPersonas','inventariable']
                    }
                ],
                order: ['fechaRetiro','fechaElaboracion']
            }
        );

        let data = [];

        for ( const e of productosExistencia ) {
            
            if( eliminadosTemporal.some( i => i.idDetalleEntradaProducto === e.dataValues.idDetalleEntradaProducto ) ){
                const temp = eliminadosTemporal.filter( i => i.idDetalleEntradaProducto === e.dataValues.idDetalleEntradaProducto )
                data = [ ...data, { ...e.dataValues, existencia: e.dataValues.existencia + temp[0].cantidadSupr }]
            }
            else{
                data = [ ...data, {...e.dataValues} ]
            }

        }

        res.status(200).json({
            ok: true,
            productosExistencia: data
        })

        
    } catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'llamar al administrador error al obtener la existecia del producto',
                error
            })
    }
}


const cancelSalidaProducto = async( req, res ) =>{

    let transaction
    transaction = await db.transaction();

    try {

        const idSalidaProducto = req.params.idSalidaProducto
        await SalidaProducto.update( { status : 'C'}, {where:{ idSalidaProducto }, transaction} );

        const detalleSalidaProducto = await DetalleSalidaProducto.findAll({ where:{ idSalidaProducto }, transaction });

        for( d of detalleSalidaProducto ){
            const existenciaSucursal = await ExistenciaProductoSucursal.findOne({ where:{ idSucursal: d.idSucursal, idProducto : d.idProducto }, transaction });
            await existenciaSucursal.update({ salidas : existenciaSucursal.salidas - d.cantidad }, {transaction} );

            const detalleEntradaProducto = await DetalleEntradaProducto.findOne({ where: { idDetalleEntradaProducto : d.idDetalleEntradaProducto }, transaction });
            await detalleEntradaProducto.update( { totalSalidas :  detalleEntradaProducto.totalSalidas - d.cantidad}, {transaction} )
        }

        await DetalleSalidaProducto.destroy({ where:{ idSalidaProducto }, transaction });

        await transaction.commit();

        res.status(200).json({
            ok: true,
        })
        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al cancelar la salida del producto',
            error
        })
    }

}

module.exports = {
    AddNewSalidaProducto,
    cancelSalidaProducto,
    getExistenciaProducto,
    getSalidasProducto,
    getSalidaProducto,
    updateSalidaProducto
}