const sequelize = require('sequelize');
const { Op } = require('sequelize');

const db = require('../db/config');
const { SalidaInsumo, DetalleSalidaInsumo, ExistenciaInsumoSucursal, DetalleEntradaInsumo, Insumo, Presentacion, UnidadMedida, Sucursal } = require("../models/indexDb");

const AddNewSalidaInsumo = async( req, res ) =>{

    let transaction;
    transaction = await db.transaction();

    try {
 
         const { dataSalidaInsumo, dataDetalleSalidaInsumo } = req.body;
 
         const salidaInsumo = await SalidaInsumo.create({
                         ...dataSalidaInsumo
             }, { transaction } )
 
         for( d of dataDetalleSalidaInsumo ){
 
             await DetalleSalidaInsumo.create({
                 ...d,
                 idSalidaInsumo : salidaInsumo.idSalidaInsumo,
                 fechaSalidaInsumo : salidaInsumo.fechaSalidaInsumo,
                 porAjuste : salidaInsumo.porAjuste,
                 idSucursal : salidaInsumo.idSucursal
             }, { transaction })

             //---- actualiza la cantidad de salidas en el detalleEntrada
            const detalle_EntradaInsumo = await DetalleEntradaInsumo.findOne(
                {   
                    where: { idDetalleEntradaInsumo : d.idDetalleEntradaInsumo } 
                }, transaction)
                
            if (!detalle_EntradaInsumo) {
                await transaction.rollback();
                res.status(500).json({
                ok: false,
                msg: 'no se encontro el detalle de entrada para actualizar',
                })
            } else {
                const suma = detalle_EntradaInsumo.totalCantidadSalida + d.totalCantidad
                await detalle_EntradaInsumo.update({ totalCantidadSalida:  suma }, { transaction } )
            }
 
            //actualiza la exitencia en la tabla existencia sucursal
             const existenciasSucursal = await ExistenciaInsumoSucursal.findOne( 
                 { where: { idInsumo: d.idInsumo, idSucursal: salidaInsumo.idSucursal}, transaction }
             )

             if (!existenciasSucursal) {
                await transaction.rollback();
                res.status(500).json({
                    ok: false,
                    msg: 'no se encontro el insumo en las exsitencias de la sucursal',
                })
             } else {
                 await existenciasSucursal.update({ salidas: existenciasSucursal.salidas + d.totalCantidad }, { transaction })
             }

         }
 
         await transaction.commit();
         
         res.status(200).json({
             ok: true,
             salidaInsumo 
         })
     } catch (error) {
         await transaction.rollback();
         res.status(500).json({
             ok: false,
             msg: 'llamar al administrador error al agregar la salida del insumo',
             error
         })
     }
 
 }

const getExitenciaInsumo = async( req, res ) => {

    try {

        const idInsumo = req.params.idInsumo
        const idSucursal = req.params.idSucursal
        const eliminadosTemporal = req.body

        const condiciones = []
        for( const e of eliminadosTemporal ){
            condiciones.push( sequelize.literal(` idDetalleEntradaInsumo = '${ e.idDetalleEntradaInsumo }' `) )
        }

        const insumosExitencia = await DetalleEntradaInsumo.findAll({ 
            where : {
                
                [Op.or]:{
                    [Op.and]:[
                        {idInsumo},
                        {idSucursal},
                        sequelize.literal( ' totalCantidad - totalCantidadSalida > 0' )
                    ],
                     ...condiciones
                }

            },
            attributes: [
                        'idEntradaInsumo','idDetalleEntradaInsumo','idInsumo','caducidad','fechaEntradaInsumo',
                        [sequelize.literal( ' totalCantidad - totalCantidadSalida' ), 'existencia'],
                        [sequelize.literal( '0' ),'cantidadPresentacion'],
                        [sequelize.literal( '0' ),'cantidadUnidad'],
                        [sequelize.literal( '0' ),'totalCantidad'],
                        'idSucursal'
                        ],
            include:[
                { 
                    model: Insumo,
                    attributes:['nombre','contenido'],
                    include:[{ model: Presentacion, as:'presentacion'}, {model: UnidadMedida, as:'unidadMedida' }]
                }
            ],
            order:['caducidad','fechaEntradaInsumo']
         })

         let data = insumosExitencia;
         for( const e of eliminadosTemporal){
                data = data.map( i => i.idDetalleEntradaInsumo === e.idDetalleEntradaInsumo ? { ...i.dataValues, existencia : i.dataValues.existencia + e.cantidadSupr } : i.dataValues );
         }
       

         res.status(200).json({
            ok: true,
            insumosExitencia :data
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener la existecia del insumo',
            error
        })
    }

}


const getSalidasInsumo = async( req, res ) =>{
    try {
        const dateStart = req.params.dateStart;
        const dateEnd = req.params.dateEnd

        const salidasInsumo = await SalidaInsumo.findAll({
            where : { fechaSalidaInsumo : {[Op.between] : [dateStart, dateEnd]} },
            include:[
                {
                    model:Sucursal,
                    as:'sucursal',
                    attributes:['nombre']
                }
            ]
        })

        res.status(200).json({
            ok: true,
            salidasInsumo 
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener el listado de salidas insumo',
            error
        })
    }
}

const getSalidaInsumo = async( req, res ) =>{
    try {

        const idSalidaInsumo = req.params.idSalida

        const salidaInsumo = await SalidaInsumo.findOne({
            where:{ idSalidaInsumo },
            include:[
                {
                    model:Sucursal,
                    as:'sucursal',
                    attributes:[
                        ['idSucursal', 'value'], 
                        ['nombre', 'label' ],
                    ]
                },
                {
                    model: DetalleSalidaInsumo,
                    include:[
                        {
                            model: Insumo,
                            attributes:['nombre','contenido'],
                            include:[
                                {   model:Presentacion, 
                                    attributes:['idPresentacion','nombre'], 
                                    as:'presentacion'
                                },
                                {   model:UnidadMedida, 
                                    attributes:['idUnidadMedida','nombre'],
                                    as:'unidadMedida' 
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        
        res.status(201).json({
            ok: true,
            salidaInsumo,
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener la saldia del insumo',
            error
        })
    }

}

const updateSaldiaInsumo = async( req, res ) => {

    let transaction
    transaction = await db.transaction();

    try {

        const idSalidaInsumo = req.params.idSalidaInsumo;
        const { dataSalidaInsumo, dataDetalleSalidaInsumo, suprsSalidasDetadalle } = req.body;

        const salidaInsumo = await SalidaInsumo.findOne( { where: { idSalidaInsumo }, transaction } );
        if ( !salidaInsumo ){
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro esa salida del insumo'
            }); 
        }

        delete dataSalidaInsumo.idSalidaInsumo
        delete dataSalidaInsumo.idSucursal
        const salidaInsumoActualizada = await salidaInsumo.update({ ...dataSalidaInsumo },{ transaction });

        for( d of dataDetalleSalidaInsumo ){
            
            const data = {
                            ...d,
                            idSalidaInsumo : salidaInsumoActualizada.idSalidaInsumo,
                            fechaSalidaInsumo :  salidaInsumoActualizada.fechaSalidaInsumo,
                            porAjuste : salidaInsumoActualizada.porAjuste,
                            idSucursal : salidaInsumo.idSucursal
            }


            if( !!data.isNew ) {
                await DetalleSalidaInsumo.create({ ...data} , { transaction });

                const detalleEntradaInsumo = await DetalleEntradaInsumo.findOne({ where : { idDetalleEntradaInsumo : data.idDetalleEntradaInsumo }, transaction });
                await detalleEntradaInsumo.update( { totalCantidadSalida :  detalleEntradaInsumo.totalCantidadSalida + data.totalCantidad }, {transaction} );

                //actualizo existenciaSucursal
                const existenciasSucursal = await ExistenciaInsumoSucursal.findOne({  where : {idInsumo : data.idInsumo, idSucursal : data.idSucursal }, transaction });
                await existenciasSucursal.update( { salidas : existenciasSucursal.salidas + data.totalCantidad }, { transaction});
                
            }else{
                // //**** ESTE CODIGO SE DESCOMENTA EN CASO QUE REALMETE EXISTA UN UPDATE YA TE TODOS DEBEN SER NEW PARA HACER CAMBIOS ***
                // const detalleSalidaInsumo = await DetalleSalidaInsumo.findOne( { where : { idDetalleSalidaInsumo : data.idDetalleSalidaInsumo } } );
                // //le resto a la nueva cantidad lo que ya exista en el registro para obtener la aumento o decremtento real
                // const detalleEntradaInsumo = await DetalleEntradaInsumo.findOne({ where : { idDetalleEntradaInsumo : data.idDetalleEntradaInsumo } });
                // await detalleEntradaInsumo.update( { totalCantidadSalida :  detalleEntradaInsumo.totalCantidadSalida + 
                //                                                             (data.totalCantidad - detalleSalidaInsumo.totalCantidad)}, { transaction } );

                // cantidadActualizarExistenciaSuc = data.totalCantidad - detalleSalidaInsumo.totalCantidad;
                // await detalleSalidaInsumo.update( {...data} , {transaction} )
            }

        }

        // //rest los insumos borrados
        for( i of suprsSalidasDetadalle ){
                
            await DetalleSalidaInsumo.destroy({ where: { idDetalleSalidaInsumo : i.idDetalleSalidaInsumo }, transaction })

            const detalleEntradaInsumo = await DetalleEntradaInsumo.findOne({ where:{ idDetalleEntradaInsumo : i.idDetalleEntradaInsumo }, transaction });
            await detalleEntradaInsumo.update( { totalCantidadSalida : detalleEntradaInsumo.totalCantidadSalida - i.cantidadSupr }, { transaction} );
            
            const existenciasSucursal = await ExistenciaInsumoSucursal.findOne({ where: { idInsumo: i.idInsumo, idSucursal : i.idSucursal }, transaction });
            await existenciasSucursal.update( { salidas: existenciasSucursal.salidas - i.cantidadSupr }, { transaction } );
        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            salidaInsumoActualizada 
        })

        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al editar la salida del insumo',
            error
        })
    }

}

const cancelSalidainsumo = async( req, res ) =>{

    let transaction
    transaction = await db.transaction();
    try {

        const idSalidaInsumo = req.params.idSalidaInsumo
        await SalidaInsumo.update({ status: 'C'},{ where:{ idSalidaInsumo }, transaction});

        const detalleSalidaInsumo = await DetalleSalidaInsumo.findAll({ where:{ idSalidaInsumo }, transaction });

        for(d of detalleSalidaInsumo){
            const existenciaSucursal = await ExistenciaInsumoSucursal.findOne({ where:{ idSucursal: d.idSucursal, idInsumo : d.idInsumo }, transaction })
            await existenciaSucursal.update({ salidas: existenciaSucursal.salidas - d.totalCantidad },{transaction});

            const  detalleEntradaInsumo = await DetalleEntradaInsumo.findOne({ where: { idDetalleEntradaInsumo : d.idDetalleEntradaInsumo }, transaction })
            await detalleEntradaInsumo.update( {totalCantidadSalida : detalleEntradaInsumo.totalCantidadSalida - d.totalCantidad},{transaction})
        }

        await DetalleSalidaInsumo.destroy({ where:{ idSalidaInsumo } , transaction})

        await transaction.commit();

        res.status(200).json({
            ok: true, 
        })
        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al cancelar la salida del insumo',
            error
        })
    }

}

module.exports={
    AddNewSalidaInsumo,
    cancelSalidainsumo,
    getSalidasInsumo,
    getSalidaInsumo,
    getExitenciaInsumo,
    updateSaldiaInsumo
}