const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { addNewPedido, getPedidos, getPedido, updatePedido } = require("../controllers/pedidos");

const router = Router();

router.use( validarJWT );

router.get('/:dateStart/:dateEnd', getPedidos)

router.get('/:idPedido', getPedido);

router.post( '/', addNewPedido );

router.put('/:idPedido', updatePedido)

module.exports = router;