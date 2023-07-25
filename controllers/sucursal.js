const { Sucursal } = require('../models/indexDb');

const getSucursales = async( req, res ) => {
    
    const sucursales = await Sucursal.findAll(
        {
          where: { activa : 1 },  
          attributes: [ 
            ['idSucursal', 'value'], 
            ['nombre', 'label' ],
            'direccion',
            'telefono',
            'mail'                          
          ]
        }
    );

    res.status(200).json({
        ok: true,
        sucursales
    })

}

module.exports = {
    getSucursales
}