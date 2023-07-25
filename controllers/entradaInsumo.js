const { Op } = require('sequelize');
const sequelize = require('sequelize');

const db = require('../db/config');
const {EntradaInsumo,DetalleEntradaInsumo, Sucursal, Insumo, ExistenciaInsumoSucursal, Presentacion, UnidadMedida } = require('../models/indexDb');

const getEntradasInsumo = async (req, res) =>{
    try {

        const dateStart = req.params.dateStart;
        const dateEnd = req.params.dateEnd

        const entradasInsumo = await EntradaInsumo.findAll({
            where : { fechaEntradaInsumo : {[Op.between] : [dateStart, dateEnd]} },
            attributes : [  'idEntradaInsumo',
                            'fechaEntradaInsumo',
                            'proveedor',
                            'descripcion',
                            'porAjuste',
                            'costoTotalEntradaInsumo',
                            'idSucursal',
                            'status'
                         ],
            include:[
                {
                    model:Sucursal,
                    as:'sucursal',
                    attributes:['nombre']
                },
                {
                    model:DetalleEntradaInsumo,
                    as:'detalleEntradaInsumo',
                    attributes:[ [sequelize.fn('sum', sequelize.col('detalleEntradaInsumo.totalCantidadSalida')),'salidas']]
                }
            ],
            group:[ 'idEntradaInsumo',
                    'fechaEntradaInsumo',
                    'proveedor','descripcion',
                    'porAjuste','costoTotalEntradaInsumo','idSucursal','status' ],
            raw:true
        })

        res.status(201).json({
            ok: true,
            entradasInsumo
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener las entradas de insumos',
            error
        })
    }
}

const getEntradaInsumo = async( req, res ) => {
    try {
        
        const idEntradaInsumo = req.params.idEntradaInsumo;

        const entradaInsumo = await EntradaInsumo.findOne( {
            where : { idEntradaInsumo },
            include: [
                {
                    model:Sucursal,
                    as:'sucursal',
                    attributes:[
                        ['idSucursal', 'value'], 
                        ['nombre', 'label' ],
                    ]
                }
            ]
        } );

        const detallesEntradaInsumo = await DetalleEntradaInsumo.findAll({
            attributes:['idDetalleEntradaInsumo',
                        'idEntradaInsumo',
                        'idInsumo',
                        'caducidad',
                        'fechaEntradaInsumo',
                        'cantidadPresentacion',
                        'cantidadUnidad',
                        'totalCantidad',
                        'totalCantidadSalida',
                        'costoTotal',
                        'porAjuste',
                        'idSucursal',
                        [sequelize.literal(0), 'isNew']
                    ],
            where:{ idEntradaInsumo },
            include:[{
                    model:Insumo,
                    attributes:[
                        'idInsumo',
                        'contenido',
                        ['idInsumo','value'],
                        ['nombre','label'],
                    ],
                    include:[
                        {
                            model:Presentacion,
                            attributes:[
                                ['idPresentacion', 'value'],
                                ['nombre','label'],
                            ],
                            as:'presentacion'
                        },
                        {
                            model:UnidadMedida,
                            attributes:[
                                ['idUnidadMedida', 'value'],
                                ['nombre','label'],
                            ],
                            as:'unidadMedida'
                        },
                    ]
            }]
        })

        res.status(201).json({
            ok: true,
            entradaInsumo,
            detallesEntradaInsumo
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener la entrada del insumo',
            error
        })
    }
}

const AddNewEntradaInsumo = async( req, res ) =>{
    
    let transaction;
    transaction = await db.transaction();

   try {

        const { dataEntradaInsumo, dataDetalleEntradaInsumo } = req.body;

            const entradaInsumo = await EntradaInsumo.create({
                        ...dataEntradaInsumo
            }, { transaction } )

        for( d of dataDetalleEntradaInsumo ){

            await DetalleEntradaInsumo.create({
                ...d,
                idEntradaInsumo : entradaInsumo.idEntradaInsumo,
                fechaEntradaInsumo : entradaInsumo.fechaEntradaInsumo,
                porAjuste : entradaInsumo.porAjuste,
                idSucursal : entradaInsumo.idSucursal
            }, { transaction })

            const existenciasSucursal = await ExistenciaInsumoSucursal.findOne( 
                { 
                    where: { idInsumo: d.idInsumo, idSucursal: entradaInsumo.idSucursal }
                })
                
            if (!existenciasSucursal) {
                await ExistenciaInsumoSucursal.create({
                    idSucursal : entradaInsumo.idSucursal,
                    idInsumo: d.idInsumo,
                    entradas : d.totalCantidad,
                    salidas: 0
                },{ transaction })
            } else {
                await existenciasSucursal.update({ entradas: existenciasSucursal.entradas + d.totalCantidad }, {transaction});
            }

        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            entradaInsumo 
        })
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al agregar entrada insumo',
            error
        })
    }

}

const updateEntradaInsumo = async( req, res ) => {
        
    let transaction;
    transaction = await db.transaction();
    try {

        const idEntradaInsumo = req.params.idEntradaInsumo;
        const { dataEntradaInsumo, dataDetalleEntradaInsumo, suprsEntradasDetalle } = req.body;
        

        const entradaInsumo = await EntradaInsumo.findOne({ where: { idEntradaInsumo }, transaction })
        
        if( !entradaInsumo ){
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro esa entrada insumo'
            }); 
        }

        //saber si esta cambiando todo de sucursal y obnter la base para generar el cambio en el array suprsEntradasDetalle
        const idSucursalbase = entradaInsumo.idSucursal
        const cambiaSuc = ( idSucursalbase !== dataEntradaInsumo.idSucursal)
        //
        const entradaInsumoActualizada = await entradaInsumo.update({...dataEntradaInsumo}, {transaction});

        //actualiza el detalle entrada
        for( d of dataDetalleEntradaInsumo ){
            
            delete d.totalCantidadSalida
            const data = {
                            ...d,
                            idEntradaInsumo : entradaInsumoActualizada.idEntradaInsumo,
                            fechaEntradaInsumo : entradaInsumoActualizada.fechaEntradaInsumo,
                            porAjuste : entradaInsumoActualizada.porAjuste,
                            idSucursal : entradaInsumoActualizada.idSucursal
            }

            let cantActualizar_TablaExistenciaSuc  = 0;
            if (data.isNew === 1 )
             { 
                await DetalleEntradaInsumo.create( { ...data }, { transaction } );
                 cantActualizar_TablaExistenciaSuc = data.totalCantidad
             }
            else { 
                //OBTENGO EL STATUS ACTUAL ANTES DE SER ACTUALIZADO PARA OBTENER LA CANTIDAD TOTAL ANTERIOR
                const detalleEntrada = await DetalleEntradaInsumo.findOne({ where : {idDetalleEntradaInsumo: data.idDetalleEntradaInsumo}, transaction });
                //validao si cambio la sucursal para restar lo que esto pasando de una sucrusal a otra en la tabla existenciaSucursal
                if ( cambiaSuc ){
                    //en caso de cambie de sucurusal le resto a la existencia general de la sucursal anterior
                    const existenciaSucursalAnterior = await ExistenciaInsumoSucursal.findOne({
                        where:{ idInsumo : data.idInsumo, idSucursal : idSucursalbase }, transaction });

                    await existenciaSucursalAnterior.update( 
                        { entradas: existenciaSucursalAnterior.entradas - detalleEntrada.totalCantidad } , 
                        { transaction } )
                     cantActualizar_TablaExistenciaSuc =  data.totalCantidad
                }
                else{
                    //la nueva cantidad menos lo que ya existia para obtener la cantidad real de lo que esta cambiando
                    // para actualizar la tabla existencia Sucursal
                     cantActualizar_TablaExistenciaSuc =  data.totalCantidad - detalleEntrada.totalCantidad
                }

                await detalleEntrada.update({ ...data }, {transaction }); 
            }

           //verifico si el insumo existe en la tabla de existencia
            const existenciaSucursal = await ExistenciaInsumoSucursal.findOne({
                where:{ idInsumo : data.idInsumo, idSucursal : entradaInsumoActualizada.idSucursal }, transaction });
            
            //sino existe lo creo y sino pues actualizo  
            if (!existenciaSucursal) {
                await ExistenciaInsumoSucursal.create({
                    idSucursal : entradaInsumoActualizada.idSucursal,
                    idInsumo: data.idInsumo,
                    entradas :  cantActualizar_TablaExistenciaSuc, 
                    salidas: 0
                },{ transaction })
            }else {
                await existenciaSucursal.update(
                            {   entradas: existenciaSucursal.entradas +  cantActualizar_TablaExistenciaSuc },
                            {   transaction   }
                );
            }
        }

        //resta los productos borrados en la edicion de la entrada del insumo 
        for( i of suprsEntradasDetalle ){

            await DetalleEntradaInsumo.destroy({ where : { idDetalleEntradaInsumo : i.idDetalleEntradaInsumo }, transaction });

            const existenciasSucursal = await ExistenciaInsumoSucursal.findOne( 
                { where: { idInsumo: i.idInsumo, idSucursal: i.idSucursal}, transaction } 
            )
            await existenciasSucursal.update(
                                        { entradas: existenciasSucursal.entradas - i.cantidadSupr }, 
                                        {transaction})

        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            entradaInsumoActualizada 
        })
        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al editar la entrada del insumo',
            error
        })
    }
}

const cancelEntradainsumo = async(req, res) =>{
    let transaction;
    transaction = await db.transaction();

    try {
        
        const idEntradaInsumo = req.params.idEntradaInsumo;

        await EntradaInsumo.update({ status : 'C' } , { where:{ idEntradaInsumo }, transaction });

        const detallesEntradaInsumo = await DetalleEntradaInsumo.findAll({ where:{ idEntradaInsumo }, transaction })

        for( d of detallesEntradaInsumo ){

            const existenciaSucursal = await ExistenciaInsumoSucursal.findOne( { where:{ idSucursal: d.idSucursal, idInsumo: d.idInsumo }, transaction} )
            await existenciaSucursal.update({ entradas: existenciaSucursal.entradas - d.totalCantidad }, { transaction })

        }

        await DetalleEntradaInsumo.destroy({ where: {idEntradaInsumo}, transaction })

        await transaction.commit();

        res.status(200).json({
            ok: true, 
        })
        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al cancelar la entrada del insumo',
            error
        })
    }

}

module.exports={
    AddNewEntradaInsumo,
    getEntradasInsumo,
    getEntradaInsumo,
    updateEntradaInsumo,
    cancelEntradainsumo
}