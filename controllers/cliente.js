const { Op } = require("sequelize");
const {Cliente} = require("../models/indexDb")

const addNewCliente = async(req, res) => {

    try {
        
        const{ nombre, direccion, telefono, fechaNacimiento, CodigoPostal, mail, movil, rfc } = req.body
        const camposCompara = [];

        console.log(req.body);

        !!rfc && camposCompara.push( { rfc } );
        !!telefono && camposCompara.push( { telefono } );
        !!movil && camposCompara.push( { movil } );
        !!mail && camposCompara.push( { mail } );
        !!nombre && camposCompara.push( { nombre } );

        const existeCliente = await Cliente.findOne({ 
                        where: {[Op.or] : [ ...camposCompara ] }
        })
    
        if (existeCliente) {
            return res.status(400).json({
                ok : false,
                msg: 'Este cliente ya esta registrado'
            }) 
        }
    
        const cliente = await Cliente.create({ ...req.body })
    
        await cliente.save();
    
        res.status(200).json({
            ok: true,
            cliente,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: error,
        })
    }


}

const updateCliente = async( req, res ) =>{
    try {

        const idCliente = req.params.idcliente;
        const cliente = await Cliente.findOne( { where: { idCliente } } );

        if( !cliente ){
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro ese cliente'
            }); 
        }

        const clienteActualizado = await cliente.update({ ...req.body });

        res.status(200).json({
            ok: true,
            clienteActualizado
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: error,
        })
    }
}

const getClientes = async( req, res ) => {
    try {
        
        const clientes = await Cliente.findAll({
            where:{ status : 'A' },
            attributes:[
                'idCliente',
                'nombre',
                'direccion',
                'codigoPostal',
                'telefono',
                'fechaNacimiento',
                'movil',
                'rfc',
                'mail',
                ['idCliente','value'],
                ['nombre','label']
            ]
        });

        res.status(200).json({
            ok: true,
            clientes,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: error,
        })
    }
}

const deleteCliente = async( req, res ) =>{
    try {

        const idCliente = req.params.idCliente
console.log(idCliente);
        await Cliente.update( { status : 'C' }, { where: { idCliente } } )

        res.status(200).json({
            ok: true,
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'no se pudo eliminar al cliente',
        })
    }
}

module.exports={
    addNewCliente,
    getClientes,
    updateCliente,
    deleteCliente
}