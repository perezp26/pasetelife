const jwt = require('jsonwebtoken');

const generarJWT = ( idUsuario = '', usuario = '', nombre = '',idPerfil='', sucursal=0  ) =>{

    return new Promise( (resolve, reject) => {

        const payload = { idUsuario, usuario, nombre, idPerfil, sucursal };
        jwt.sign( payload, process.env.SECRET_JWT_SEED,{
            expiresIn: '24h'
        }, (err, token) =>{
            
            if (err) {
                console.log(err);
                reject('No se pudo generar el token')
            } else {
                resolve(token);
            }
            
        });

    }) 

}

module.exports = generarJWT