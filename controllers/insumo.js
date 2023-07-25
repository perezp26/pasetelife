const sequelize = require('sequelize');
const {Insumo, Presentacion, UnidadMedida, ExistenciaInsumoSucursal} = require("../models/indexDb");


const addNewInsumo = async(req, res) =>{

    try {
        
        const insumo = await Insumo.create({
            ...req.body
        })

        await insumo.save();

        res.status(200).json({
            ok: true,
            insumo,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al agregar insumo',
        })
    }

}

const updateInsumo = async( req, res ) =>{
    try {

        const idInsumo = req.params.idinsumo;

        const insumo = await Insumo.findOne( { where : { idInsumo } });
        
        if( !insumo ){
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro ese insumo'
            }); 
        }

        //TODO:Valdiar que no tenga movimientos para poder editar la preesentación

        const insumoActualizado = await insumo.update({ ...req.body });

        res.status(200).json({
            ok: true,
            insumoActualizado
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al actualizar insumo',
            error
        })

    }
}

const getInsumos = async( req, res ) =>{
    try {

        const insumos = await Insumo.findAll({
            attributes:[
                'idInsumo',
                'nombre',
                'descripcion',
                'idPresentacion',
                'contenido',
                'idUnidadMedida',
                'activo',
                ['idInsumo','value'],
                ['nombre','label'],
            ],
            include:[
                {
                    model:Presentacion,
                    attributes:[
                        ['idPresentacion', 'value'],
                        ['nombre','label'],
                        'activo'
                    ],
                    as:'presentacion'
                },
                {
                    model:UnidadMedida,
                    attributes:[
                        ['idUnidadMedida', 'value'],
                        ['nombre','label'],
                        'activo'
                    ],
                    as:'unidadMedida'
                },
                {
                    model:ExistenciaInsumoSucursal,
                    attributes:[
                        'idSucursal',
                        'entradas',
                        'salidas'
                    ],
                    as:'existenciasucursal'
                }
            ],
            order:[
                //[{ model:ExistenciaSucursal, as:'sucursal' },'idSucursal',],
                [ 'nombre' ]
            ],
        })

        res.status(200).json({
            ok: true,
            insumos,
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al consultar insumos',
            error
        })
    }
}

module.exports = {
    addNewInsumo,
    getInsumos,
    updateInsumo
}