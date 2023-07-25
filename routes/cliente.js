const { Router } = require("express");
const { addNewCliente, getClientes, updateCliente, deleteCliente } = require("../controllers/cliente");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();

router.use( validarJWT );

router.get('/', getClientes)

router.post('/addclient', addNewCliente);

router.put('/:idcliente', updateCliente);

router.delete('/:idCliente', deleteCliente);

module.exports = router