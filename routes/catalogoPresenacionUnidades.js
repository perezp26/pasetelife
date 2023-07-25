
const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { getPresentacionUnidades } = require("../controllers/catalogoPresentacionUnidades");

const router = Router();

router.use( validarJWT );

router.get('/', getPresentacionUnidades);

module.exports = router;