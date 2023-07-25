
const sequelize = require('sequelize');

const db = require('../db/config');
const { Producto, InsumoRelacionado, tipoCategoria, tipoRelleno, tipoCubierta, Insumo, ExistenciaProductoSucursal } = require('../models/indexDb');

const getProductos = async( req, res ) =>{
   try {

        const productos = await Producto.findAll( {
            attributes:[    'idProducto',
                            'codigoProducto',
                            'nombre',
                            'descripcion',
                            'idTipoCategoria',
                            'idTipoRelleno',
                            'idTipoCubierta',
                            'numPersonas',
                            'inventariable',
                            'precioVenta',
                            ['idProducto','value'],
                            [sequelize.fn('concat',sequelize.col('productos.nombre'),' - ', sequelize.col('numPersonas'),' Pax'),'label']
                        ],
            include: [  
                {
                    model: tipoCategoria,
                    attributes: [
                        ['idTipoCategoria', 'value'],
                        ['nombre','label'],
                        'activo'
                    ],
                    as:'categoria'
                },
                {
                    model: tipoRelleno,
                    attributes: [
                        ['idTipoRelleno', 'value'],
                        ['nombre','label'],
                        'activo'
                    ],
                    as:'relleno'
                },
                {
                    model: tipoCubierta,
                    attributes: [
                        ['idTipoCubierta', 'value'],
                        ['nombre','label'],
                        'activo'
                    ],
                    as:'cubierta'
                },
                {
                    model:ExistenciaProductoSucursal,
                    attributes:[
                        'idSucursal',
                        'entradas',
                        'salidas'
                    ],
                    as:'existenciasucursal'
                }
            ]
        } );

        res.status(200).json({
            ok: true,
            productos,
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtener lista de productos',
        })
    }
}

const getInsumosRelacionados = async(req, res) =>{

    try {
        const idProducto = req.params.idProducto;

        const insumosRelacionados = await InsumoRelacionado.findAll( {
            where: { idProducto },
            attributes:['idInsumoRelacionado', 'cantidadInsumo'],
            include:[
                {
                    model: Insumo,
                    attributes:['idInsumo','nombre','idUnidadMedida'],
                    as:'insumo',
                    required : false
                }
            ]
        })
        res.status(200).json({
            ok: true,
            insumosRelacionados,
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al obtner insumos relacionados',
        })
    }

}


const addNewProducto = async( req, res ) =>{

    let transaction;
    transaction = await db.transaction();

    const { dataProducto ,  insumosRelacionados } = req.body

    try {
        const producto = await Producto.create( { ...dataProducto }, { transaction } );

        for ( i of insumosRelacionados ) {

            await InsumoRelacionado.create({
                        idInsumoRelacionado : i.idInsumoRelacionado,
                        idProducto : producto.idProducto,
                        cantidadInsumo : i.cantidadInsumo,
                        idInsumo : i.insumo.idInsumo
            },{transaction})

        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            producto
        })

        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al agregar producto',
        })
    }
}

const updateProducto = async( req, res ) => {

    let transaction;
    transaction = await db.transaction();

    try {
        const idProducto = req.params.idProducto
        const { dataProducto ,  insumosRelacionados } = req.body

        delete dataProducto.idProducto

        const producto = await Producto.update({ ...dataProducto },{ where: { idProducto }, transaction });

        await InsumoRelacionado.destroy({ where: { idProducto }, transaction })

        for ( i of insumosRelacionados ){

            await InsumoRelacionado.create({
                                            idInsumoRelacionado : i.idInsumoRelacionado,
                                            idProducto : idProducto,
                                            cantidadInsumo : i.cantidadInsumo,
                                            idInsumo : i.insumo.idInsumo
                                        },{transaction})

        }

        await transaction.commit();

        res.status(200).json({
            ok: true,
            producto : producto
        })
        
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({
            ok: false,
            msg: 'llamar al administrador error al editar producto',
        })
    }
}

module.exports = {
    addNewProducto,
    getProductos,
    getInsumosRelacionados,
    updateProducto
}