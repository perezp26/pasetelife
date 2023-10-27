const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { getStatusCaja, setAperturaCaja, getDataCierreCaja, setCierreCaja } = require("../controllers/controlCaja");

const router = Router();

router.use( validarJWT );

router.get('/:idSucursal/:idCaja', getStatusCaja )
router.get('/cierrecaja/:idControlAperturaCierreCaja/:idSucursal', getDataCierreCaja )

router.post('/:idSucursal/:idCaja', setAperturaCaja );
router.put('/:idSucursal/:idCaja/:idControlAperturaCierreCaja', setCierreCaja)

module.exports = router