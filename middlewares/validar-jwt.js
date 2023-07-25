const { response } = require("express");
const jwt = require('jsonwebtoken');

const validarJWT = ( req, res = response, next) =>{

    const token = req.header('x-token');

    if (!token) {
        return res.status(400).json({
            ok: false,
            msg: 'No hay token para la petición '
        })

    }

    try {

        const payload = jwt.verify( token, process.env.SECRET_JWT_SEED);

        req.idUsuario = payload.idUsuario,
        req.usuario = payload.usuario,
        req.nombre = payload.nombre,
        req.idPerfil = payload.idPerfil,
        req.sucursal = payload.sucursal

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        })
    }


    next();

}

module.exports = {
    validarJWT
}