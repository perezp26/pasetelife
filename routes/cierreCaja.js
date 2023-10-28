const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { getCierres } = require("../controllers/cierreCaja");

const router = Router();

router.use( validarJWT );

router.get('/:dateStart/:dateEnd/:idSucursal', getCierres)


module.exports = router;