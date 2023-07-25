const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { addNewProducto, getProductos, getInsumosRelacionados, updateProducto } = require("../controllers/producto");

const router = Router();

router.use( validarJWT );

router.get('/', getProductos);
router.get('/:idProducto', getInsumosRelacionados)

router.post('/', addNewProducto);

router.put('/:idProducto', updateProducto);

module.exports = router;