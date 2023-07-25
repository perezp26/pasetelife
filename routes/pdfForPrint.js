const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { generarTicketVenta } = require("../controllers/pdfForPrint");

const router = Router();

router.use( validarJWT );

router.patch('/ticketventa', generarTicketVenta);

module.exports = router