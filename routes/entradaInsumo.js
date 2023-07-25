const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const { AddNewEntradaInsumo, getEntradasInsumo, getEntradaInsumo, updateEntradaInsumo, cancelEntradainsumo } = require("../controllers/entradaInsumo");

const router = Router()

router.use( validarJWT );

router.get("/:dateStart/:dateEnd", getEntradasInsumo);
router.get("/:idEntradaInsumo", getEntradaInsumo)

router.post("/", AddNewEntradaInsumo );

router.put("/:idEntradaInsumo", updateEntradaInsumo);

router.delete("/:idEntradaInsumo", cancelEntradainsumo);

module.exports = router