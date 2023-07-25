const sequelize = require('sequelize');
const { Op } = require('sequelize');

const db = require('../db/config');
const {TicketVenta, DetallesTicketVenta, DetalleEntradaProducto, ExistenciaProductoSucursal, InsumoRelacionado, DetalleEntradaInsumo, ExistenciaInsumoSucursal, Cliente, Producto, Usuario} = require('../models/indexDb');


const addNewTicketVenta = async( req, res ) => {

    let transaction;
    transaction = await db.transaction();

    try {
        
        const { dataTicketVenta, dataDetalleTickeVenta } = req.body
        const ticketVenta = await  TicketVenta.create({ ...dataTicketVenta }, { transaction } );

        for( d of dataDetalleTickeVenta ){
            await DetallesTicketVenta.create( {
                ...d,
                idTicketVenta : ticketVenta.idTicketVenta,
                fechaTicketVenta : ticketVenta.fechaTicketVenta,
                idSucursal : ticketVenta.idSucursal
            } ,{ transaction })
            if( d.inventariable === "1"){
                    //--------------actualiza existencias en los productos ------------------//
                    //--- actualiza la cantidad de salidas en el detalle de la entrada
                    const detalleEntradaProducto = await DetalleEntradaProducto.findOne({
                        where:{ idDetalleEntradaProducto : d.idDetalleEntradaProducto }, transaction
                    });

                    if(!detalleEntradaProducto) {
                        await transaction.rollback();
                        res.status(500).json({
                        ok: false,
                        msg: 'no se encontro el detalle de entrada para actualizar',
                        })
                    } else {
                        const suma = detalleEntradaProducto.totalSalidas +  d.cantidad;
                        await detalleEntradaProducto.update( { totalSalidas : suma }, { transaction } );
                    }

                    // actualiza la existencia en la tabla existencia sucursal producto
                    const existenciasSucursal = await ExistenciaProductoSucursal.findOne({
                        where:{ idProducto : d.idProducto, idSucursal : ticketVenta.idSucursal }, transaction
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
                    //--------------FIN DE actualiza existencias en los productos ------------------//
            }

            //--- valido los insumos relacionados y los descuento
            const insumosRelacionados = await InsumoRelacionado.findAll( {where:{ idProducto : d.idProducto }, transaction});
            for( i of insumosRelacionados ){

                const detalleEntradaInsumo = await DetalleEntradaInsumo.findOne({
                    where:{  
                        [Op.and]:[
                        {idInsumo : i.idInsumo },
                        {idSucursal: ticketVenta.idSucursal},
                        sequelize.literal( ' totalCantidad - totalCantidadSalida > 0' )
                    ] },
                    order:['caducidad','idEntradaInsumo']
                }, transaction);

                if(detalleEntradaInsumo){
                    const suma = detalleEntradaInsumo.totalCantidadSalida + (i.cantidadInsumo * d.cantidad)
                    await detalleEntradaInsumo.update({ totalCantidadSalida: suma }, {transaction })
                    //actualiza la exitencia en la tabla existencia sucursal
                    const existenciasSucursal = await ExistenciaInsumoSucursal.findOne( 
                        { where: { idInsumo: i.idInsumo, idSucursal: ticketVenta.idSucursal}, transaction }
                    )
                    if(existenciasSucursal){
                        await existenciasSucursal.update({ salidas: existenciasSucursal.salidas + (i.cantidadInsumo * d.cantidad) }, { transaction })
                    }
                }

            }
            //fin de disminuir insumos relacionados   
        }   

        await transaction.commit();

        await db.query(`UPDATE ticketsVenta,(SELECT max(folio) as max FROM ticketsventa WHERE idSucursal = ${ ticketVenta.idSucursal } ) AS maxFolio
                                SET folio = maxFolio.max + 1 
                                WHERE idTicketVenta = ${ ticketVenta.idTicketVenta } `)

        const ticketVentaFolio = await TicketVenta.findOne({ where:{ idTicketVenta : ticketVenta.idTicketVenta } })
        res.status(200).json({
            ok: true,
            ticketVentaFolio 
        })

    } catch (error) {
        await transaction.rollback();
         res.status(500).json({
             ok: false,
             msg: 'llamar al administrador error al agregar un nuevo ticket',
             error
         });
    }
}

const getVentasRealizadas = async( req, res ) => {
        try {

            const dateStart = req.params.dateStart + ' 00:00:00';
            const dateEnd = req.params.dateEnd + ' 23:59:59';
            const idSucursal = req.params.idSucursal;

            const ticketsVentas = await TicketVenta.findAll({
                attributes:[
                                'idTicketVenta',
                                'folio',
                                [sequelize.literal(`CAST(fechaTicketVenta as CHAR(19))`) , 'fechaTicketVenta'],
                                'idCliente',
                                'formaPago',
                                'referencia',
                                'observaciones',
                                'descuento',
                                'total',
                                'idSucursal',
                                'status'
                ],
                where : {
                    fechaTicketVenta : {[Op.between] : [dateStart, dateEnd]},
                    idSucursal
                },
                include:[
                    {
                        model:Cliente,
                        attributes:[ ['idCliente','value'], ['nombre','label' ]]
                    }
                ]
            })

            res.status(200).json({
                ok: true,
                ticketsVentas 
            })
            
        } catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'llamar al administrador error al consultar las ventas',
                error
            });
        }
}

const getTicketVenta = async( req, res ) => {
    try {

        const idTicketVenta = req.params.idTicketVenta;

        const ticketVenta = await TicketVenta.findOne({
            where : { idTicketVenta },

            attributes:[
                    'idTicketVenta',
                    'folio',
                    [sequelize.literal(`CAST(ticketsVenta.fechaTicketVenta as CHAR(19))`) , 'fechaTicketVenta'],
                    'idCliente',
                    'formaPago',
                    'referencia',
                    'observaciones',
                    'subtotal',
                    'iva',
                    'descuento',
                    'total',
                    'recibido',
                    'idSucursal',
                    'status'
            ],

            include:[
                {
                    model:Cliente,
                    attributes:[
                                'nombre'
                               ]
                },
                {
                    model:DetallesTicketVenta,
                    include:[
                                {
                                    model: Producto,
                                    attributes:['codigoProducto','nombre','numPersonas']
                                }
                    ]
                },
                {
                    model: Usuario,
                    attributes:['nombre']
                }
            ]
        })

        const detallesTicketVenta = ticketVenta.dataValues.detallesTicketVenta


        const losIdsProductos = detallesTicketVenta.reduce((acum, item) => {
            return !acum[item.idProducto] 
            ? {...acum,  [item.idProducto]: 1  } 
            : { ...acum, [item.idProducto]: acum[item.idProducto] + 1  }
        }, {});

        const idsProductos = Object.keys( losIdsProductos );

        let resumenDetallesTicket = []
        for( p of idsProductos ){

            const _detalleTicketVenta = detallesTicketVenta.filter( d => d.idProducto === parseInt(p, 10) );

            const objResumen = _detalleTicketVenta.reduce((acum, item) => {
                return !acum[item.idProducto] 
                ? {...acum,  [item.idProducto]: 1 , cantidad: item.cantidad, idProducto: item.idProducto, producto : item.producto, totalPrecioVenta : item.totalPrecioVenta } 
                : { ...acum, [item.idProducto]: acum[item.idProducto] + 1, cantidad : acum.cantidad + item.cantidad, totalPrecioVenta : acum.totalPrecioVenta + item.totalPrecioVenta  }
            }, {})

            resumenDetallesTicket = [ ...resumenDetallesTicket, objResumen ]
        }

        res.status(200).json({
            ok: true,
            ticketVenta,
            resumenDetallesTicket
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al consultar el ticket de venta',
            error
        });
    }
}

const cancelarTicketVenta = async( req, res) => {
        let transaction = await db.transaction();

        try {

            const idTicketVenta = req.params.idTicketVenta
            const ticketVenta  = await TicketVenta.findOne({ where: { idTicketVenta } }, transaction)
            await ticketVenta.update({status:'C'},{transaction});

            const detallesTicketVenta = await DetallesTicketVenta.findAll({ where : {idTicketVenta } }, transaction)

            for( d of detallesTicketVenta ){
                const existenciaProductoSuc = await ExistenciaProductoSucursal.findOne({
                                              where:{ idSucursal : d.idSucursal, idProducto : d.idProducto }
                }, transaction);
                await existenciaProductoSuc.update({ salidas: existenciaProductoSuc.salidas - d.cantidad },{transaction});

                const detalleEntradaProducto = await DetalleEntradaProducto.findOne({ where: { idDetalleEntradaProducto : d.idDetalleEntradaProducto }, transaction });
                await detalleEntradaProducto.update( { totalSalidas :  detalleEntradaProducto.totalSalidas - d.cantidad}, {transaction} )

                //regreso lo sinsumos relacionados
                const insumosRelacionados = await InsumoRelacionado.findAll( {where:{ idProducto : d.idProducto }, transaction});
                for( i of insumosRelacionados ){

                    const detalleEntradaInsumo = await DetalleEntradaInsumo.findOne({
                        where:{  
                            [Op.and]:[
                            {idInsumo : i.idInsumo },
                            {idSucursal: ticketVenta.idSucursal}
                        ] },
                        order:['caducidad','idEntradaInsumo']
                    }, transaction);

                    if(detalleEntradaInsumo){
                        const suma = detalleEntradaInsumo.totalCantidadSalidas - i.cantidadInsumo
                        await detalleEntradaInsumo.update({ totalCantidadSalidas: suma }, {transaction })
                        //actualiza la exitencia en la tabla existencia sucursal
                        const existenciasSucursal = await ExistenciaInsumoSucursal.findOne( 
                            { where: { idInsumo: i.idInsumo, idSucursal: ticketVenta.idSucursal}, transaction }
                        )
                        if(existenciasSucursal){
                            await existenciasSucursal.update({ salidas: existenciasSucursal.salidas - i.cantidadInsumo }, { transaction })
                        }
                    }

                }

            }

            await DetallesTicketVenta.update({ status:'C' }, { where: { idTicketVenta }, transaction})


            await transaction.commit();
    
            res.status(200).json({
                ok: true,
                msg:'ticket borrado' 
            })
            
        } catch (error) {
            await transaction.rollback();
            res.status(500).json({
                ok: false,
                msg: 'llamar al administrador error al cancelar el ticket de venta',
                error
            });
        }
}

module.exports={
    addNewTicketVenta,
    getVentasRealizadas,
    getTicketVenta,
    cancelarTicketVenta
}