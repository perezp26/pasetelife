const { Router } = require("express");
const { getSucursales } = require("../controllers/sucursal");

const router = Router();

router.get('/', getSucursales)


module.exports = router