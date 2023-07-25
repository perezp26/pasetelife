const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { getCaducidadesProducto, getCaducidadesInsumos } = require("../controllers/caducidades");

const router = Router();

router.use( validarJWT );

router.get('/:idSucursal/:numDias', getCaducidadesProducto);
router.get('/caducidadesInsumos/:idSucursal/:numDias', getCaducidadesInsumos)


module.exports = router;