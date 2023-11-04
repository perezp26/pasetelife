const sequelize = require('sequelize');
const { Op } = require('sequelize');

const db = require('../db/config');

const {AperturaCierreCaja, ControlApeturaCierreCaja, TicketVenta, Pedido, AbonoPedido} = require("../models/indexDb");


const getStatusCaja = async( req, res ) => {

    const idSucursal = req.params.idSucursal
    const idCaja = req.params.idCaja
    
    const statusCaja = await AperturaCierreCaja.findOne(
        {
            where:{ idSucursal, idCaja }
        }
    );

    let controlAperturaCierre = {}

    if(statusCaja) {
        
        if(statusCaja.dataValues.status === "O"){
             controlAperturaCierre = await ControlApeturaCierreCaja.findOne({ 
                        where:{ idSucursal, idCaja }, 
                        order:[ ['fechaHoraApertura','DESC'] ] })
        }

    }

    res.status(200).json({
        ok: true,
        statusCaja,
        controlAperturaCierre
    })

}

const setAperturaCaja = async(req, res) => {

    let transaction = await db.transaction();

    try {

        const idSucursal = req.params.idSucursal
        const idCaja = req.params.idCaja
        const aperturaCierreCaja = await AperturaCierreCaja.findOne({ where:{ idSucursal, idCaja }, transaction });
        await aperturaCierreCaja.update( { status : 'O' },{ transaction } );

        const controlAperturaCierre = await ControlApeturaCierreCaja.create( {  idSucursal, idCaja, ...req.body }, {transaction} )

        await transaction.commit();

        res.status(200).json({
            ok: true,
            aperturaCierreCaja,
            controlAperturaCierre 
        })

        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error abrir caja',
            error
        });
    }
}

const getDataCierreCaja = async(req, res) => {
    const idControlAperturaCierreCaja = req.params.idControlAperturaCierreCaja
    const idSucursal = parseInt(req.params.idSucursal);

    const controlAperturaCierre = await ControlApeturaCierreCaja.findOne({ where:{ idControlAperturaCierreCaja } })

    const totalImportes = await TicketVenta.findAll({ 
                        where:{ 
                                fechaTicketVenta : {[Op.gte] : controlAperturaCierre.fechaHoraApertura}, 
                                status : { [Op.ne] : 'C' },
                                idSucursal 
                               },
                        attributes:[
                            'formaPago',
                            [sequelize.fn('SUM', sequelize.col('total')), 'total']
                        ],
                        group:[ 'formaPago' ],
                        raw:true
                    
    });

    const totalImportesAbonos = await AbonoPedido.findAll({
        where:{ 
            fechaAbono : {[Op.gte] : controlAperturaCierre.fechaHoraApertura}, 
            idSucursal 
           },
        attributes:[
            'formaPago',
            [sequelize.fn('SUM', sequelize.col('montoAbono')), 'total']
        ],
        group:[ 'formaPago' ],
        raw:true
    })

    res.status(200).json({
        ok: true,
        totalImportes,
        totalImportesAbonos
    })
}

const setCierreCaja = async(req, res) => {

    let transaction = await db.transaction();

    try {

        const idControlAperturaCierreCaja = req.params.idControlAperturaCierreCaja
        const idSucursal = req.params.idSucursal
        const idCaja = req.params.idCaja
        const aperturaCierreCaja = await AperturaCierreCaja.findOne({ where:{ idSucursal, idCaja }, transaction });
        await aperturaCierreCaja.update( { status : 'C' },{ transaction } );

        const controlAperturaCierre = await ControlApeturaCierreCaja.findOne( {  where : {  idControlAperturaCierreCaja }, transaction} )
        await controlAperturaCierre.update( { fechaHoraCierre : req.body.fechaHoraCierre, montoCierre : req.body.montoCierre }, { transaction })

        await TicketVenta.update(
                                    { idControlAperturaCierreCaja :  controlAperturaCierre.idControlAperturaCierreCaja },
                                    { where:{ fechaTicketVenta : {[Op.gte] : controlAperturaCierre.fechaHoraApertura}, 
                                                             status : { [Op.ne] : 'C' } }, transaction }
                                )
        await AbonoPedido.update(
            { idControlAperturaCierreCaja :  controlAperturaCierre.idControlAperturaCierreCaja },
            { where:{ fechaAbono : {[Op.gte] : controlAperturaCierre.fechaHoraApertura}, 
                                        }, transaction }
        )

        await transaction.commit();

        res.status(200).json({
            ok: true,
            aperturaCierreCaja,
            controlAperturaCierre 
        })

        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error cerrar caja',
            error
        });
    }
}

module.exports = {
    getStatusCaja,
    setAperturaCaja,
    getDataCierreCaja,
    setCierreCaja
}