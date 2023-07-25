const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { addNewTicketVenta, getVentasRealizadas, getTicketVenta, cancelarTicketVenta } = require("../controllers/ticketVenta");

const router = Router();

router.use( validarJWT );

router.get('/:dateStart/:dateEnd/:idSucursal', getVentasRealizadas);

router.get('/:idTicketVenta', getTicketVenta)

router.post('/', addNewTicketVenta );

router.delete('/:idTicketVenta', cancelarTicketVenta)

module.exports = router