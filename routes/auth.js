const { Router } = require("express");
const { check } = require("express-validator");
const { loginUsuario, revalidarToken, getUsuarios } = require("../controllers/auth");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();

router.get('/', [validarJWT], getUsuarios);

router.post('/', loginUsuario );

router.post('/renew',[ validarJWT ], revalidarToken )

module.exports = router