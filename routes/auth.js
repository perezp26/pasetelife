const { Router } = require("express");
const { check } = require("express-validator");
const { loginUsuario, revalidarToken, getUsuarios, get_Perfiles_Modulos, getPermisos_Usuario } = require("../controllers/auth");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();

router.get('/', [validarJWT], getUsuarios);

router.post('/', loginUsuario );

router.post('/renew',[ validarJWT ], revalidarToken );

router.get('/get-perfiles-modulos',[
        validarJWT
], get_Perfiles_Modulos);

router.get('/getpermisos-usuarios/:idusuario',[
    validarJWT 
], getPermisos_Usuario)

module.exports = router