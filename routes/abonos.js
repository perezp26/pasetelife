const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { addNewAbono, getAbonos, deleteAbono } = require("../controllers/abonos");

const router = Router();

router.use( validarJWT );

router.get('/:idPedido', getAbonos);

router.post( '/', addNewAbono );

router.delete('/:idAbonoPedido', deleteAbono)

module.exports = router;