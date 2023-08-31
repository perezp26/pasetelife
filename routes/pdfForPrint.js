const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { generarTicketVenta, generarTicketPedido, generarTicketAbono } = require("../controllers/pdfForPrint");

const router = Router();

router.use( validarJWT );

router.patch('/ticketventa', generarTicketVenta);

router.patch('/ticketpedido', generarTicketPedido);

router.patch('/ticketabono', generarTicketAbono)

module.exports = router