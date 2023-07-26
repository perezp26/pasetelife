const { Op } = require('sequelize');
const sequelize = require('sequelize');

const db = require('../db/config');
const {EntradaProducto, DetalleEntradaProducto, ExistenciaProductoSucursal, Sucursal, Producto} = require('../models/indexDb');

const getEntradasProducto = async( req, res ) => {
    try {

        const dateStart = req.params.dateStart;
        const dateEnd = req.params.dateEnd

        const entradasProducto = await EntradaProducto.findAll({
            where : { fechaEntradaProducto : {[Op.between] : [dateStart, dateEnd]} },
            attributes:[
                'idEntradaProducto',
                'fechaEntradaProducto',
                'descripcion',
                'costoTotalEntradaProducto',
                'idSucursal',
                'porAjuste',
                'status'
            ],
            include:[
                {
                    model:Sucursal,
                    as:'sucursal',
                    attributes:['nombre']
                },
                {
                    model:DetalleEntradaProducto,
                    as:'detalleEntradaProducto',
                    attributes:[ [sequelize.fn('sum', sequelize.col('detalleEntradaProducto.totalSalidas')), 'salidas' ]],

                }
            ],
            group:[
                'idEntradaProducto',
                'fechaEntradaProducto',
                'descripcion',
                'costoTotalEntradaProducto',
                'idSucursal',
                'porAjuste',
                'status'
            ],
            raw:true
        })

        res.status(201).json({
            ok: true,
            entradasProducto
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener las entradas de productos',
            error
        })
    }
}

const getEntradaProducto = async( req, res ) =>{

    //try {

        const idEntradaProducto = req.params.idEntradaProducto

        const entradaProducto = await EntradaProducto.findOne({
            where: { idEntradaProducto },
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
                    model: DetalleEntradaProducto,
                    attributes: [
                        'idDetalleEntradaProducto',
                        'idEntradaProducto',
                        'cantidad',
                        'idProducto',
                        'fechaEntradaProducto',
                        'fechaElaboracion',
                        'maxDiasVenta',
                        'fechaRetiro',
                        'precioVenta',
                        [sequelize.literal('cantidad * detalleentradaproducto.precioVenta'), 'totalPrecioVenta' ],
                        'idSucursal',
                        'porAjuste',
                        'totalSalidas',
                        [sequelize.literal('0'), 'isNew']
                    ],
                    as:  'detalleEntradaProducto',
                    include:[
                        {
                            model:Producto,
                            attributes:['idProducto','codigoProducto','nombre','numPersonas']
                        }
                    ]
                }
            ],
        })

        res.status(201).json({
            ok: true,
            entradaProducto,
        })
        
    // } catch (error) {
    //     res.status(500).json({
    //         ok: false,
    //         msg: 'llamar al administrador error al obtener la entrada del producto',
    //         error
    //     })
    // }

}

const updateEntradaProducto = async( req, res ) =>{

    let transaction;
    transaction = await db.transaction();

    try {
        
        const idEntradaProducto = req.params.idEntradaProducto;
        const { dataEntradaProducto, dataDetalleEntradaProducto, suprsEntradaProductoDetalle } = req.body

        const entradaProducto = await EntradaProducto.findOne({ where: { idEntradaProducto },  transaction })
        if(!entradaProducto){
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro esa entrada producto'
            }); 
        }

        //saber si cambiando todo de una sucursal y obtener la base para generar cambio en array que suprime entradas
        const idSucursalBase = entradaProducto.idSucursal
        const cambiaSuc = (idSucursalBase !== dataEntradaProducto.idSucursal);

        const entradaProductoUpdate = await entradaProducto.update({ ...dataEntradaProducto }, {transaction});

        //actualiza el detalle entrada producto
        for( d of dataDetalleEntradaProducto ){
            
            delete d.totalSalidas
            const data = {  ...d,
                            idEntradaProducto: entradaProductoUpdate.idEntradaProducto,
                            fechaEntradaProducto : entradaProductoUpdate.fechaEntradaProducto,
                            porAjuste : entradaProductoUpdate.porAjuste,
                            idSucursal : entradaProductoUpdate.idSucursal
            }
            
            let cantActualizar_TablaExistenciaSuc = 0;
            if (data.isNew === 1)
            {
                await DetalleEntradaProducto.create({ ...data, totalSalidas: 0 }, { transaction });
                cantActualizar_TablaExistenciaSuc = data.cantidad
            }
            else{
                //OBTENGO EL STATUS DEL PRODUCTO ANTES DE SER ACTUALIZADO PARA OBTENER LA CANTIDAD PREVIA A LA ACT.
                const detalleEntradaProducto = await DetalleEntradaProducto.findOne({
                    where:{ idDetalleEntradaProducto : data.idDetalleEntradaProducto },
                    transaction
                })

                    //validao si comabio de sucursal para resta lo que esto paso a la nueva sucursal en la tb existenciaSuc
                    if( !cambiaSuc ){
                    cantActualizar_TablaExistenciaSuc = data.cantidad - detalleEntradaProducto.cantidad
                    }
                    else {
                        //resto la cantidad que voy a pasar a la nueva sucursal en la tabla existenciaSuc
                        const existenciaSucursalAnterior = await ExistenciaProductoSucursal.findOne({
                            where:{ idProducto : data.idProducto, idSucursal : idSucursalBase }, transaction
                        })

                        await existenciaSucursalAnterior.update(
                            { entradas: existenciaSucursalAnterior.entrada - data.cantidad  },
                            { transaction }
                        )
                        cantActualizar_TablaExistenciaSuc = data.cantidad
                    }
                await detalleEntradaProducto.update( { ...data }, {transaction} ); 
            }

            //verifico si el producto existe en la tabla de existencia
            const existenciaSucursal = await ExistenciaProductoSucursal.findOne({
                where:{ idProducto : data.idProducto, idSucursal: entradaProductoUpdate.idSucursal }, transaction
            })
            //si existe la actualizo sino la creo
            if ( existenciaSucursal ){
                await existenciaSucursal.update({ entradas : existenciaSucursal.entradas + cantActualizar_TablaExistenciaSuc  }
                    ,{transaction})
            }else{
                await ExistenciaProductoSucursal.create({
                    idSucursal: entradaProductoUpdate.idSucursal,
                    idProducto : data.idProducto,
                    entradas : cantActualizar_TablaExistenciaSuc,
                    salidas : 0
                },{transaction})
            }
        }

        for( i of suprsEntradaProductoDetalle ){

            await DetalleEntradaProducto.destroy({ where: { idDetalleProducto : i.idDetalleEntradaProducto}, transaction})

            const existenciaSucursal = await ExistenciaProductoSucursal.findOne(
                {where:{ idProducto : i.idProducto, idSucursal : i.idSucursal }, transaction}
            )

        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            entradaProductoUpdate 
        })

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al editar la entrada del producto',
            error
        })
    }
}



const addNewEntradaProducto = async( req, res) =>{
    let transaction;
    transaction = await db.transaction();
    try {

        const { dataEntradaProducto, dataDetalleEntradaProducto } = req.body;

        const entradaProducto = await EntradaProducto.create(
            {...dataEntradaProducto },
            { transaction }
        )
        console.log( entradaProducto.idEntradaProducto );
        for( d of dataDetalleEntradaProducto ){
            await DetalleEntradaProducto.create(
                {
                    ...d,
                    idEntradaProducto: entradaProducto.idEntradaProducto,
                    fechaEntradaProducto: entradaProducto.fechaEntradaProducto,
                    idSucursal: entradaProducto.idSucursal,
                    porAjuste: entradaProducto.porAjuste
                },
                {transaction}
            )
            const existenciaSucursalProducto = await ExistenciaProductoSucursal.findOne(
                {
                    where:{ idProducto: d.idProducto, idSucursal: entradaProducto.idSucursal }
                })
            
            if(!existenciaSucursalProducto){
                await ExistenciaProductoSucursal.create({
                    idSucursal : entradaProducto.idSucursal,
                    idProducto : d.idProducto,
                    entradas : d.cantidad,
                    salidas : 0
                },{ transaction })
            }else{
                await existenciaSucursalProducto.update({ entradas: existenciaSucursalProducto.entradas + d.cantidad }, {transaction});
            }
        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            entradaProducto 
        })
        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al agregar entrada producto',
            error
        })
    }
}

const cancelEntradaProducto = async( req, res ) =>{
    let transaction = await db.transaction();

    try {

        const idEntradaProducto = req.params.idEntradaProducto;

        await EntradaProducto.update({ status : 'C'}, { where:{ idEntradaProducto }, transaction });

        const detallesEntradaProducto = await DetalleEntradaProducto.findAll({
            where: { idEntradaProducto }, transaction
        })

        for( d of detallesEntradaProducto ){

            const existenciasSucursal = await ExistenciaProductoSucursal.findOne({ where:{ idSucursal: d.idSucursal, idProducto : d.idProducto }, transaction });
            await existenciasSucursal.update({ entradas: existenciasSucursal.entradas - d.cantidad }, { transaction } );

        }

        await DetalleEntradaProducto.destroy({ where:{ idEntradaProducto }, transaction })

        await transaction.commit();

        res.status(200).json({
            ok: true, 
        });

        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al cancelar la entrada del producto',
            error
        })
    }
}

module.exports={
    getEntradasProducto,
    getEntradaProducto,
    addNewEntradaProducto,
    updateEntradaProducto,
    cancelEntradaProducto
}