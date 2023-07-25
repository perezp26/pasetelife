const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { getExitenciaInsumo, AddNewSalidaInsumo, getSalidasInsumo, getSalidaInsumo, updateSaldiaInsumo, cancelSalidainsumo } = require("../controllers/salidaInsumo");


const router = Router()

router.use( validarJWT );

router.get('/:dateStart/:dateEnd', getSalidasInsumo)
router.get('/:idSalida', getSalidaInsumo)

router.patch('/existenciainsumo/:idSucursal/:idInsumo', getExitenciaInsumo);

router.post('/', AddNewSalidaInsumo);

router.put('/:idSalidaInsumo', updateSaldiaInsumo);

router.delete('/:idSalidaInsumo', cancelSalidainsumo)

module.exports= router

