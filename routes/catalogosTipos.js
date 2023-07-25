const { Router } = require("express");

const { validarJWT } = require("../middlewares/validar-jwt");
const { getCatalogosTipos, addNewRelleno, updateRelleno, addNewCategoria, updateCategoria, addNewCubierta, updateCubierta } = require("../controllers/catalogosTipos");

const router = Router();

router.use( validarJWT );

router.get('/', getCatalogosTipos);

router.post('/addnewcategoria', addNewCategoria);

router.post('/addnewcubierta', addNewCubierta);

router.post('/addnewrelleno', addNewRelleno);

router.put('/updatecategoria/:idtipocategoria', updateCategoria);

router.put('/updatecubierta/:idtipocubierta', updateCubierta);

router.put('/updaterelleno/:idtiporelleno', updateRelleno);

module.exports = router