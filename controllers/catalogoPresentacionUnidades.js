const {Presentacion, UnidadMedida} = require("../models/indexDb.js");


const getPresentacionUnidades = async (req, res) => {
    try {
        const presentacionUnidadesPromise =   Promise.all([
            await Presentacion.findAll({
                attributes : [
                    ['idPresentacion', 'value'],
                    ['nombre','label'],
                    'activo'
                ]
            }),
            await UnidadMedida.findAll({
                attributes : [
                    ['idUnidadMedida', 'value'],
                    ['nombre','label'],
                    'activo'
                ]
            }),
        ])

        const values = await presentacionUnidadesPromise;
        const [ presentaciones, unidadesMedida ] = values;
        res.status(200).json({
            ok: true,
            data : { presentaciones, unidadesMedida },
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }
    
}

module.exports={
    getPresentacionUnidades
}