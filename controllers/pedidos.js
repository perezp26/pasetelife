const sequelize = require('sequelize');
const {Op} = require('sequelize');

const db = require('../db/config');
const { Pedido, AbonoPedido, Cliente, Sucursal } = require('../models/indexDb');


const addNewPedido =  async ( req, res ) =>{

    let transaction = await db.transaction();

    try {
        const { anticipo, montoAnticipo } = req.body
        const pedido = await Pedido.create({ 
            ...req.body
        },{ transaction} )

        if ( anticipo === '1' ){
            await AbonoPedido.create({
                idPedido : pedido.idPedido,
                idSucursal : pedido.idSucursal,
                fechaAbono : pedido.fechaPedido,
                formaPago : pedido.formaPago,
                montoAbono : montoAnticipo,
                descripcionAbono: pedido.precio <= montoAnticipo ? 'Líquido' : 'Anticipo Incial',
                idUsuario : pedido.idUsuario
            },{ transaction })
        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            pedido:{ ...pedido.dataValues, ['abonosPedidos.totalAbonos'] : montoAnticipo },
        })
        
    } catch (error) {
        res.status(500).json({      
            ok: false,
            msg: 'llamar al administrador error al agregar el pedido',
        })
    }

}

const updatePedido = async( req, res ) => {
    try {

        const idPedido = req.params.idPedido;
        const { fechaPedidio, fechaEntrega, idSucursal, idCliente, descripcionProducto, numPersonas, precio } = req.body
        const data = {
            fechaPedidio,
            fechaEntrega,
            idSucursal, 
            idCliente,
            descripcionProducto,
            numPersonas,
            precio
        }
 
        const pedido  = await Pedido.findOne( { where:{ idPedido } } );
        const updatePedido = await pedido.update( { ...data } );


        res.status(200).json({
            ok: true,
            pedido: updatePedido,
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al acutalizar el pedido',
        })
    }
}

const getPedidos = async( req, res ) =>{
    try {

        const dateStart = req.params.dateStart + ' 00:00:00';
        const dateEnd = req.params.dateEnd + ' 23:59:59';

        const pedidos = await Pedido.findAll( { 
                            where : { fechaPedido : {[Op.between] : [dateStart, dateEnd]} },
                            attributes : [
                                'idPedido',
                                [sequelize.literal('CAST(fechaPedido as CHAR(19))'),'fechaPedido'],
                                'fechaEntrega',
                                'descripcionProducto',
                                'precio',
                                'anticipo',
                                'status',
                               
                            ],
                            include: [
                                {
                                    model: AbonoPedido,
                                    attributes:[
                                        [sequelize.fn('sum', sequelize.col('abonosPedidos.montoAbono')), 'totalAbonos' ]
                                    ],
                                },
                                {
                                    model: Cliente,
                                    attributes:[
                                        'nombre'
                                    ]
                                },
                                {
                                    model: Sucursal,
                                    as: 'sucursal',
                                    attributes:[
                                        'idSucursal',
                                        'nombre',
                                        'telefono'
                                    ]
                                }
                            ],
                            group:['idPedido', 'fechaPedido', 'fechaEntrega', 'descripcionProducto', 'precio', 'anticipo', 'status',
                                    'cliente.nombre','sucursal.idSucursal', 'sucursal.nombre','sucursal.telefono'
                            ],
                            raw: true
        });

        res.status(200).json({
            ok: true,
            pedidos,
        })
        
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener los pedidos',
        })
    }
}

const getPedido = async( req, res ) => {
    try {
        
        const idPedido = req.params.idPedido;

        const pedido = await Pedido.findOne({
            where: { idPedido } ,
            include:[
                {
                    model: Cliente,
                    attributes : [  ['idCliente','value'],
                                    ['nombre','label']
                                 ]
                },
                {
                    model: Sucursal,
                    as: 'sucursal',
                    attributes:[
                                    ['idSucursal','value'],
                                    ['nombre','label']
                    ]
                }
            ]
        })

        res.status(200).json({
            ok: true,
            pedido,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener el pedido',
        })
    }
}

module.exports = {
    addNewPedido,
    getPedidos,
    getPedido,
    updatePedido
}