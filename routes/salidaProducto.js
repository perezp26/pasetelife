const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { getExistenciaProducto, AddNewSalidaProducto, getSalidasProducto, cancelSalidaProducto, getSalidaProducto, updateSalidaProducto } = require("../controllers/salidaProducto");

const router = Router()

router.use( validarJWT );

router.get('/:dateStart/:dateEnd', getSalidasProducto);
router.get('/:idSalidaProducto', getSalidaProducto);

router.post('/', AddNewSalidaProducto);

router.put('/:idSalidaProducto', updateSalidaProducto)

router.patch('/existenciaproducto/:idSucursal/:idProducto', getExistenciaProducto);

router.delete('/:idSalidaProducto', cancelSalidaProducto)

module.exports = router;