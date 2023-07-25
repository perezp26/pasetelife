const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { addNewEntradaProducto, getEntradasProducto, getEntradaProducto, updateEntradaProducto, cancelEntradaProducto } = require("../controllers/entradaProducto");

const router = Router();

router.use( validarJWT );

router.get('/:dateStart/:dateEnd', getEntradasProducto);
router.get('/:idEntradaProducto', getEntradaProducto);

router.post('/', addNewEntradaProducto);

router.put('/:idEntradaProducto', updateEntradaProducto);

router.delete('/:idEntradaProducto', cancelEntradaProducto)

module.exports = router;