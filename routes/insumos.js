const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { addNewInsumo, getInsumos, updateInsumo } = require("../controllers/insumo");

const router = Router();

router.use( validarJWT );

router.get('/', getInsumos);

router.post('/', addNewInsumo);

router.put('/:idinsumo', updateInsumo)

module.exports = router;