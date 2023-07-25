const PdfPrinter = require("pdfmake");
const Roboto = require("../fonts/Roboto");

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
            width: 180,
            height: 'auto'
        },
        pageMargins : [ 1, 1, 1, 1 ],
        styles:{
            body:{
                fontSize : 12
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
                text:'-----------------------------------------------------'
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
                text:'-----------------------------------------------------'
            },
            {
                style:{
                    fontSize:8
                },
                color: '#555',
                margin: [0,5,0,0],
                table: {
                    widths: [ 20, 115, 30 ],
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
                text:'-----------------------------------------------------'
            },
            {
                margin:[5,4,3,0],
                text:`Total: ${ ticketVenta.total.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }`, fontSize:8, alignment:'right'
            },
            {
                margin:[5,1,3,0],
                text:`Recibido: ${ ticketVenta.recibido.toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }`, fontSize:8, alignment:'right'
            },
            {
                margin:[5,2,3,0],
                text:`Cambio: ${ (ticketVenta.recibido - ticketVenta.total).toLocaleString?.('es-MX',{style:'currency',currency: 'MXN',}) }`, fontSize:8, alignment:'right'
            },
            {
                margin:[5,7,5,0],
                text:`LOS PASTELES SON NUESTRA PASIÓN`, fontSize:'8', alignment:'center'
            },
            {
                margin:[5,0,5,10],
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

module.exports={
    generarTicketVenta
}