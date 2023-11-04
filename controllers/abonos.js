const sequelize = require('sequelize');
const {Op} = require('sequelize');

const db = require('../db/config');
const {AbonoPedido} = require('../models/indexDb');


const addNewAbono = async( req, res ) => {
    
    try {
        
            const abono = await AbonoPedido.create({
                ...req.body
            })

            abono.save();

            res.status(200).json({
                ok: true,
                abono,
            })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al agregar el abono',
        })
    }
}

const getAbonos = async( req, res) => {
    try {
        const idPedido = req.params.idPedido
        const abonos = await AbonoPedido.findAll({
                where : { idPedido },
                attributes : [
                    'idAbonoPedido',
                    'idSucursal',
                    'idPedido',
                    [sequelize.literal('CAST(fechaAbono as CHAR(19))'),'fechaAbono'],
                    'formaPago',
                    'montoAbono',
                    'descripcionAbono',
                    'idUsuario',
                    'idControlAperturaCierreCaja'
                ] 
        })
        
        res.status(200).json({
            ok:true,
            abonos
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener los abonos',
        })
    }
}

const deleteAbono = async( req, res ) => {
    try {
        const idAbonoPedido = req.params.idAbonoPedido
        
        await AbonoPedido.destroy({ where:{ idAbonoPedido } });

        res.status(200).json({
            ok:true,
            msg : 'Abono borrado correctamente'
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al eliminar el abono',
        })
    }
}

module.exports = {
    addNewAbono,
    getAbonos,
    deleteAbono
}