const { Router } = require("express");
const { check } = require("express-validator");
const { loginUsuario, revalidarToken, getUsuarios, get_Perfiles_Modulos, getPermisos_Usuario, updateUsuario, crearUsuario, updatePassword } = require("../controllers/auth");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarcampos } = require("../middlewares/validar-campos");

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

router.post('/newuser',[
    check('nombre','el nombre es obligatorio').not().isEmpty(),
    check('nombre','minimo 4 caracteres').isLength( { min: 4} ),
    check('usuario','el usuario es obligatorio').not().isEmpty(),    
    check('usuario','minimo 4 caracteres').isLength( { min: 4} ),
    // check('password','el password es obligatorio').not().isEmpty(),    
    // check('password','minimo 6 caracteres').isLength( { min: 6} ),
    validarcampos
], crearUsuario);

router.put('/updateuser/:idusuario',[
    check('nombre','el nombre es obligatorio').not().isEmpty(),
    check('nombre','minimo 4 caracteres').isLength( { min: 4} ),
    check('usuario','el usuario es obligatorio').not().isEmpty(),    
    check('usuario','minimo 4 caracteres').isLength( { min: 4} ),
    validarcampos
], updateUsuario)


router.post('/updatepassword/:idusuario',[
    validarJWT
], updatePassword);

module.exports = router