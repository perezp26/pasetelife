const PdfPrinter = require("pdfmake");
const sequelize = require('sequelize');

const Roboto = require("../fonts/Roboto");
const AbonoPedido = require("../models/abonoPedido");

const generarTicketVenta = (req, res) => {

    const dataTicket = req.body;

    const { sucursal, ticketVenta, resumenDetallesTicket } = dataTicket;

    const rowsDetalle = resumenDetallesTicket.map( d => [
            { text : d.cantidad, alignment: 'center' } , 
            { text: `${d.producto.nombre.substring(0,30)} ${ (d.totalPrecioVenta / d.cantidad).toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) } ` }, 
            { text: `${d.totalPrecioVenta.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',})}`, alignment : 'right' }
        ]
    )
    rowsDetalle.unshift(['Cant', 'Descripción', 'Importe'])
    
    const docDefinition = {

        pageSize:{
            width: 138,
            height: 'auto'
        },
        pageMargins : [ 1, 1, 1, 1 ],
        styles:{
            body:{
                fontSize : 10
            }
        },
        content : [
            {
                margin:[5,10,0,0],
                text:'PASTELIFE', fontSize:8,
            },
            {
                margin:[5,0,0,0],
                columns:[
                    {
                        text : `${ sucursal.label }` , fontSize:8, alignment: 'left', width: 180
                    }
                ]
            },  
            {
                margin:[5,0,0,0],
                text:`${ sucursal.telefono }`, fontSize:8,
            },
            {
                margin:[2,-5,0,0],
                text:'----------------------------------------'
            },
            {
                margin:[5,0,0,0],
                text:`Le atendio: ${ ticketVenta.usuario.nombre }`, fontSize:8,
            },
            {
                margin:[5,3,0,0],
                text:`Ticket # : ${ ticketVenta.folio }`, fontSize:8
            },
            {
                margin:[5,3,0,0],
                text:`${ ticketVenta.fechaTicketVenta }`, fontSize:8
            },
            {
                margin:[5,3,0,0],
                text:`${ ticketVenta.cliente?.nombre ?? 'Publico en general'}`, fontSize:8
            },
            {
                margin:[2,-5,0,0],
                text:'----------------------------------------'
            },
            {
                style:{
                    fontSize:7
                },
                margin: [0,5,0,0],
                table: {
                    widths: [ 20, 75, 30 ],
                    body: rowsDetalle,
                },
                layout: {
                    hLineColor: function(i, node) {
                        return (i === 0 || i === node.table.body.length) ? 'white' : 'white';
                    },
                    vLineColor: function(i, node) {
                        return (i === 0 || i === node.table.widths.length) ? 'white' : 'white';
                    },
                    paddingLeft: function(i, node) { return 1; },
                    paddingRight: function(i, node) { return 1; },
                    paddingTop: function(i, node) { return 1; },
                    paddingBottom: function(i, node) { return 1; }
                    
                }
                
            },
            {
                margin:[2,-5,0,0],
                text:'----------------------------------------'
            },
            {
                margin:[2,4,3,2],
                text:`Total: ${ ticketVenta.total.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }`, fontSize:8, alignment:'right'
            },
            {
                margin:[2,1,3,2],
                text:`Recibido: ${ ticketVenta.recibido.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }`, fontSize:8, alignment:'right'
            },
            {
                margin:[2,2,3,2],
                text:`Cambio: ${ (ticketVenta.recibido - ticketVenta.total).toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }`, fontSize:8, alignment:'right'
            },
            {
                margin:[2,7,5,2],
                text:`LOS PASTELES SON NUESTRA PASIÓN`, fontSize:'8', alignment:'center'
            },
            {
                margin:[2,0,5,10],
                text:`¡¡Gracias por su preferencia!!`, fontSize:'8', alignment:'center'
            },
        ]

    }

    const printer = new PdfPrinter(Roboto);

    const pdfDoc = printer.createPdfKitDocument( docDefinition );
    res.set('content-type', 'application/pdf');
    pdfDoc.pipe( res );
    pdfDoc.end();


}


const generarTicketPedido = async (req, res) => { 

    const { idPedido, fechaPedido, fechaEntrega, descripcionProducto, ["cliente.nombre"] : cliente, ["sucursal.nombre"] : sucursalNombre,
            ["sucursal.telefono"] : sucursalTelefono, usuario, precio, ["abonosPedidos.totalAbonos"] :totalAbonos  } = req.body;

    const abonos = await AbonoPedido.findAll({
            where : { idPedido  } ,
            attributes:[
                'idAbonoPedido',
                'idPedido',
                [sequelize.literal(`CAST(fechaAbono as CHAR(19))`) , 'fechaAbono'],
                'formaPago',
                'montoAbono',
                'descripcionAbono'
            ]
    })

    const detalleAbonos = abonos.map( d => [
                            { text : `${ d.fechaAbono.substring(8,10)}/${ d.fechaAbono.substring(5,7) } `, alignment: 'left' } , 
                            { text: `${d.descripcionAbono } ` }, 
                            { text: `${d.montoAbono.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',})}`, alignment : 'right' }
                        ]
    )

    detalleAbonos.unshift(['Fecha', 'Descripción', 'Importe']);

    const docDefinition = {

        pageSize:{
            width: 120,
            height: 'auto'
        },
        pageMargins : [ 1, 1, 1, 1 ],
        styles:{
            body:{
                fontSize : 8
            }
        },
        content : [
                    {
                        margin:[5,10,0,0],
                        text:'PASTELIFE', fontSize:8,
                    },
                    {
                        margin:[5,0,0,0],
                        columns:[
                            {
                                text : `${ sucursalNombre }` , fontSize:8, alignment: 'left', width: 180
                            }
                        ]
                    },  
                    {
                        margin:[5,0,0,0],
                        text:`${ sucursalTelefono }`, fontSize:8,
                    },
                    {
                        margin:[2,-5,0,0],
                        text:'----------------------------------'
                    },
                    {
                        margin:[5,0,0,0],
                        text:`Le atendio: ${ usuario }`, fontSize:8,
                    },
                    {
                        margin:[5,3,0,0],
                        text:`Ticket # : ${ idPedido }`, fontSize:8
                    },
                    {
                        margin:[5,3,0,0],
                        text:`Fecha Pedido: ${ fechaPedido }`, fontSize:8
                    },
                    {
                        margin:[5,3,0,0],
                        text:`Fecha Entrega: ${ fechaEntrega }`, fontSize:8
                    },
                    {
                        margin:[5,3,0,0],
                        text:`${ cliente ?? 'Publico en general'}`, fontSize:8
                    },
                    {
                        margin:[2,-5,0,0],
                        text:'----------------------------------'
                    },

                    {
                        margin:[5,0,0,0],
                        text:`${ descripcionProducto }`, fontSize:8, alignment: 'justify'
                    },
                    {
                        margin:[2,-5,0,0],
                        text:'----------------------------------'
                    },
                    {
                        style:{
                            fontSize:8
                        },
                        color: '#555',
                        margin: [2,0,0,0],
                        table: {
                            widths: [ 25, 55, 30 ],
                            body: detalleAbonos,
                        },
                        layout: {
                            hLineColor: function(i, node) {
                                return (i === 0 || i === node.table.body.length) ? 'white' : 'white';
                            },
                            vLineColor: function(i, node) {
                                return (i === 0 || i === node.table.widths.length) ? 'white' : 'white';
                            },
                            paddingLeft: function(i, node) { return 1; },
                            paddingRight: function(i, node) { return 1; },
                            paddingTop: function(i, node) { return 1; },
                            paddingBottom: function(i, node) { return 1; }
                            
                        }
                        
                    },
                    {
                        margin:[2,-5,0,0],
                        text:'----------------------------------'
                    },

                    {
                        margin:[2,0,0,0],
                        color: '#555',
                        table: {
                            widths: [60,50],
                            body: [
                                [
                                    {text: `Precio total` ,color:'#000', alignment:'left' , fontSize: 8, bold: true},
                                    {text: `${ precio.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }` ,color:'#000', alignment:'right' , fontSize: 8, bold: true}
                                ],
                                [
                                    {text: `Abonos total` ,color:'#000', alignment:'left' , fontSize: 8, bold: true},
                                    {text: `${ totalAbonos.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }` ,color:'#000', alignment:'right' , fontSize: 8, bold: true}
                                ],
                                [
                                    {text: `Saldo total` ,color:'#000', alignment:'left' , fontSize: 8, bold: true},
                                    {text: `${ (precio - totalAbonos).toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }` ,color:'#000', alignment:'right' , fontSize: 8, bold: true}
                                ],
                            ]
                        },
                        layout: {
                            hLineColor: function(i, node) {
                                return (i === 0 || i === node.table.body.length) ? 'white' : 'white';
                            },
                            vLineColor: function(i, node) {
                                return (i === 0 || i === node.table.widths.length) ? 'white' : 'white';
                            },
                            paddingLeft: function(i, node) { return 1; },
                            paddingRight: function(i, node) { return 1; },
                            paddingTop: function(i, node) { return 1; },
                            paddingBottom: function(i, node) { return 1; }
                            
                        }
                    },
        ]
    
    }

    const printer = new PdfPrinter(Roboto);

    const pdfDoc = printer.createPdfKitDocument( docDefinition );
    res.set('content-type', 'application/pdf');
    pdfDoc.pipe( res );
    pdfDoc.end();
}

const generarTicketAbono = async( req, res) => {
   
}

module.exports={
    generarTicketVenta,
    generarTicketPedido,
    generarTicketAbono,
}