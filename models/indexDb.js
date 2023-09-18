
const AbonoPedido = require('./abonoPedido');
const Cliente = require('./cliente');
const {AperturaCierreCaja, ControlApeturaCierreCaja} = require('./controlCaja')
const DetalleEntradaInsumo = require('./detalleEntradaInsumo');
const DetalleEntradaProducto = require('./detalleEntradaProducto');
const DetalleSalidaInsumo = require('./detalleSalidaInsumo');
const DetalleSalidaProducto = require('./detallesSalidaProducto');
const DetallesTicketVenta = require('./detalleTicketVenta');
const EntradaInsumo = require('./entradaInsumo');
const EntradaProducto = require('./entradaProducto');
const ExistenciaInsumoSucursal = require('./existenciaInsumoSucursal');
const ExistenciaProductoSucursal = require('./existenciaProductoSucursal');
const Insumo = require('./insumo');
const InsumoRelacionado = require('./insumoRelacionado');
const Pedido = require('./pedido');
const Presentacion = require('./presentacion');
const Producto = require('./producto');
const SalidaInsumo = require('./salidaInsumo');
const SalidaProducto = require('./salidaProducto');
const Sucursal  = require( './sucursal' );
const TicketVenta = require('./ticketVenta');
const{ tipoCubierta, tipoCategoria, tipoRelleno } = require('./catalogosTipos');
const { Usuario, Permiso, Modulo, PermisosUsuarios, Perfil } = require('./usuario');
const UnidadMedida = require('./unidadMedida');

Usuario.belongsToMany(Permiso, { through : 'permisos_usuarios', foreignKey : 'idusuario'});
Permiso.belongsToMany(Usuario, { through:'permisos_usuarios', foreignKey : 'idpermiso' });
Usuario.belongsTo( Perfil, { as:'Perfil', foreignKey : 'idPerfil' } );
Usuario.belongsTo( Sucursal, { as:'sucursal', foreignKey: 'idSucursal' } )

EntradaInsumo.belongsTo(Sucursal, {  as:'sucursal', foreignKey:'idSucursal' });
EntradaInsumo.hasMany(DetalleEntradaInsumo,{ as:'detalleEntradaInsumo', foreignKey:'idEntradaInsumo'});
DetalleEntradaInsumo.belongsTo( Insumo, { foreignKey: 'idInsumo' } );

EntradaProducto.belongsTo(Sucursal, { as:'sucursal', foreignKey:'idSucursal' });
EntradaProducto.hasMany(DetalleEntradaProducto,{ as:'detalleEntradaProducto', foreignKey:'idEntradaProducto' });
DetalleEntradaProducto.belongsTo(Producto, { foreignKey: 'idProducto'});

Insumo.belongsTo( Presentacion,{  as:'presentacion', foreignKey: 'idPresentacion' } );
Insumo.belongsTo( UnidadMedida, { as:'unidadMedida', foreignKey: 'idUnidadMedida' });
Insumo.hasMany( ExistenciaInsumoSucursal,{ as:'existenciasucursal', foreignKey:'idInsumo' } );
InsumoRelacionado.belongsTo( Insumo, { as:'insumo', foreignKey:'idInsumo' } )

SalidaInsumo.belongsTo( Sucursal, {  as:'sucursal', foreignKey:'idSucursal' } );
SalidaInsumo.hasMany(DetalleSalidaInsumo, { foreignKey: 'idSalidaInsumo' });
DetalleSalidaInsumo.belongsTo( Insumo, { foreignKey: 'idInsumo' } );

SalidaProducto.belongsTo( Sucursal, {as:'sucursal', foreignKey:'idSucursal'} );
SalidaProducto.hasMany(DetalleSalidaProducto, { foreignKey:'idSalidaProducto'});
DetalleSalidaProducto.belongsTo( Producto, { foreignKey: 'idProducto' })

Producto.belongsTo( tipoCategoria, { as:'categoria', foreignKey:'idTipoCategoria' } );
Producto.belongsTo( tipoCubierta, { as:'cubierta', foreignKey:'idTipoCubierta' } );
Producto.belongsTo( tipoRelleno, { as:'relleno', foreignKey:'idTipoRelleno' } );
Producto.hasMany( InsumoRelacionado, { as:'insumosRelacionados', foreignKey:'idProducto' } );
Producto.hasMany( ExistenciaProductoSucursal, {as: 'existenciasucursal', foreignKey:'idProducto'} );

TicketVenta.hasMany( DetallesTicketVenta, { foreignKey:'idTicketVenta' } );
TicketVenta.belongsTo( Cliente, { foreignKey:'idCliente' } );
TicketVenta.belongsTo(Sucursal,{ as:'sucursal', foreignKey:'idSucursal'});
TicketVenta.belongsTo( Usuario, { foreignKey:'idUsuario' });
DetallesTicketVenta.belongsTo(Producto, { foreignKey:'idProducto'});

Modulo.hasMany(Permiso,{ foreignKey: 'idModulo' });
Permiso.belongsTo(Modulo,{ foreignKey: 'idModulo' });

Pedido.hasMany(AbonoPedido,{ foreignKey: 'idPedido' });
Pedido.belongsTo(Cliente, { foreignKey:'idCliente' } );
Pedido.belongsTo(Sucursal, { as:'sucursal', foreignKey:'idSucursal' });
Pedido.belongsTo(Usuario,{ foreignKey:'idUsuario' }  );

module.exports = {
    AbonoPedido,
    AperturaCierreCaja,
    Cliente,
    ControlApeturaCierreCaja,
    DetalleEntradaInsumo,
    DetalleEntradaProducto,
    DetalleSalidaInsumo,
    DetalleSalidaProducto,
    DetallesTicketVenta,
    EntradaInsumo,
    EntradaProducto,
    ExistenciaInsumoSucursal,
    ExistenciaProductoSucursal,
    Insumo,
    InsumoRelacionado,
    Modulo,
    Pedido,
    Perfil,
    Permiso,
    PermisosUsuarios,
    Presentacion,
    Producto,
    SalidaInsumo,
    SalidaProducto,
    Sucursal,
    TicketVenta,
    tipoCategoria,
    tipoCubierta,
    tipoRelleno,
    UnidadMedida,
    Usuario
}