const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('../db/config');


class Server {

    constructor(){
        this.app = express();
        this.port = process.env.PORT || 3001;

        this.paths = {
            abono : '/api/abono/',
            auth : '/api/auth/',
            caducidades:'/api/caducidades',
            catTipos:'/api/catalogostipos/',
            cierreCaja : '/api/cierrecaja/',
            cliente:'/api/cliente/',
            controlCaja : '/api/controlcaja/',
            entradaInsumo: '/api/entradainsumo/',
            entradaProducto: '/api/entradaproducto/',
            insumo: '/api/insumo/',
            pedido: '/api/pedido/',
            presntacionesUnidades: '/api/presentacionesunidades',
            printPdf: '/api/print',
            producto : '/api/producto',
            salidaInsumo:'/api/salidainsumo/',
            salidaProducto:'/api/salidaproducto/',
            sucursales: '/api/sucursales/',
            ticketVenta: '/api/ticketventa/'
        }

        this.dbConnection();

        //Middlewares
        this.middlewares();

        //rutas de la aplicacion
        this.routes();
    }

    async dbConnection() {
        try {
            await db.authenticate(); 
        } catch (error) {
            throw new Error()
        }
    }

    middlewares(){
        this.app.use( cors() );
        this.app.use( express.static('public') );
        this.app.use(express.json({limit: '1mb'}));
    }

    routes(){
        this.app.use(this.paths.abono, require('../routes/abonos'));
        this.app.use(this.paths.auth, require('../routes/auth'));
        this.app.use(this.paths.caducidades, require('../routes/caducidades'));
        this.app.use(this.paths.catTipos, require('../routes/catalogosTipos'));
        this.app.use(this.paths.cierreCaja, require('../routes/cierreCaja'));
        this.app.use(this.paths.cliente, require('../routes/cliente'));
        this.app.use(this.paths.controlCaja, require('../routes/controlCaja'));
        this.app.use(this.paths.entradaInsumo, require('../routes/entradaInsumo'));
        this.app.use(this.paths.entradaProducto, require('../routes/entradaProducto'));
        this.app.use(this.paths.insumo, require('../routes/insumos'));
        this.app.use(this.paths.pedido, require('../routes/pedido'));
        this.app.use(this.paths.presntacionesUnidades, require('../routes/catalogoPresenacionUnidades'));
        this.app.use(this.paths.printPdf, require('../routes/pdfForPrint'));
        this.app.use(this.paths.producto, require('../routes/producto'));
        this.app.use(this.paths.salidaInsumo, require('../routes/salidaInsumo'));
        this.app.use(this.paths.salidaProducto, require('../routes/salidaProducto'));
        this.app.use(this.paths.sucursales, require('../routes/sucursales'));
        this.app.use(this.paths.ticketVenta, require('../routes/ticketVenta'));

        this.app.get("/*", function(req, res) {
            res.sendFile( path.join(__dirname, '../',"public", "index.html"));
        });
    }

    listen(){
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en el puerto ', this.port);
        })
    }
}

module.exports = Server;