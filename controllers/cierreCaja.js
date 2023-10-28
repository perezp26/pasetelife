const sequelize = require('sequelize');
const {Op} = require('sequelize');
const { ControlApeturaCierreCaja } = require('../models/controlCaja');

const getCierres = async( req, res ) =>{
    // try {

        const dateStart = req.params.dateStart + ' 00:00:00';
        const dateEnd = req.params.dateEnd + ' 23:59:59';
        const idSucursal = req.params.idSucursal;
        console.log(dateEnd);
        const listAperturasCierres = await ControlApeturaCierreCaja.findAll( { 
                            where : { idSucursal, fechaHoraCierre : {[Op.between] : [dateStart, dateEnd]} },
                            attributes:[
                                'idControlAperturaCierreCaja',
                                'idSucursal',
                                'idCaja',
                                [sequelize.literal('CAST(fechaHoraApertura as CHAR(19))'),'fechaHoraApertura'],
                                'montoApertura',
                                [sequelize.literal('CAST(fechaHoraCierre as CHAR(19))'),'fechaHoraCierre'],
                                'montoCierre'
                            ]
                            
        });

        res.status(200).json({
            ok: true,
            listAperturasCierres,
        })
        
        
    // } catch (error) {
    //     res.status(500).json({
    //         ok: false,
    //         msg: 'llamar al administrador error al obtener los cierres',
    //     })
    // }
}

module.exports = {
    getCierres
}