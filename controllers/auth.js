const sequelize = require('sequelize');
const bcrypt = require('bcryptjs');

const { Usuario, Permiso, Perfil, Modulo, PermisosUsuarios } = require("../models/indexDb");
const generarJWT = require('../helpers/generaJWT');


const loginUsuario = async( req, res) => {

    try {
            const { usuario, password, sucursal } = req.body;
        
            const user = await Usuario.findOne({
                where: {
                    usuario : usuario
                },
                attributes : [  'idUsuario','nombre','usuario','password','idPerfil'],
                include : [
                    {
                      model : Permiso, 
                      attributes : ['idPermiso', 'idModulo'],    
                      required: false
                    },
                    {
                        model : Perfil,   
                        as: 'Perfil' ,
                        attributes: [ 
                            ['idPerfil', 'value'], 
                            ['descripcion', 'label' ]                             
                          ],
                        required: false
                      }
                ]
            })

            if (!user){
                return res.status(400).json({
                     ok : false,
                     msg: 'Credenciales invalidas!!'
                 }) 
             }
     
             const validaPass = bcrypt.compareSync( password, user.password);
             if (!validaPass){
                 return res.status(400).json({
                      ok : false,
                      msg: 'Credenciales invalidas!!'
                  }) 
              }

              if ( user.idPerfil != 1 && user.idPerfil != sucursal.value ){
                return res.status(400).json({
                    ok : false,
                    msg: 'Credenciales invalidas!!'
                }) 
              }
            
            const token = await generarJWT(user.idUsuario, user.usuario, user.nombre, user.idPerfil, sucursal)

            const permisos = user.dataValues.permisos.map( p => ( p.idPermiso ) );
            const modulosList = user.dataValues.permisos.map( m => ( m.idModulo ));
            const modulos = [...new Set( modulosList )];

            res.status(200).json({
                ok: true,
                usuario : {
                    idUsuario : user.idUsuario,
                    nombre : user.nombre,
                    usuario : user.usuario,
                    perfil : user.Perfil,
                    permisos,
                    modulos,
                    sucursal
                },
                token
            })

    } catch (error) {
            res.status(500).json({
                ok: false,
                msg: 'Hable con el administrador'
        }) 
    }

}

const revalidarToken = async( req, res) => {

    const  {idUsuario, usuario, nombre, idPerfil, sucursal} = req
    try {
        const token = await generarJWT(idUsuario, usuario, nombre, idPerfil, sucursal)

            const user = await Usuario.findOne({
                where: {
                    usuario : usuario
                },
                attributes : ['idUsuario','nombre','usuario','password'],
                include : [
                    {
                    model : Permiso, 
                    attributes : ['idPermiso','idModulo'],    
                    required: false
                    },
                    {
                        model : Perfil,   
                        as: 'Perfil' ,
                        attributes: [ 
                            ['idPerfil', 'value'], 
                            ['descripcion', 'label' ]                             
                        ],
                        required: false
                    }
                ]
            });

            const permisos = user.dataValues.permisos.map( p => ( p.idPermiso ) );
            const modulosList = user.dataValues.permisos.map( m => ( m.idModulo ));
            const modulos = [...new Set( modulosList )];

            res.status(200).json(
                {
                    ok : true,
                    usuario : {
                        idUsuario : user.idUsuario,
                        nombre : user.nombre,
                        usuario : user.usuario,
                        perfil : user.Perfil,
                        permisos,
                        modulos,
                        sucursal
                    },
                    token
                }
            )
    } catch (error) {
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }
}

const getUsuarios = async( req = request, res = response) =>{

    try {
        const usersResult = await Usuario.findAll({
            include : [
                // {
                //   model : Permiso, 
                //   attributes : ['idpermiso'],
                //   required: false
                // },
                {
                  model: Perfil,
                  as: 'Perfil',
                  attributes : [ ['idPerfil', 'value'], 
                                 ['descripcion', 'label' ]
                               ],
                  required: true
                }
            ]
        });
    
        
        res.status(200).json({
            ok: true,
            usersResult,
        })
    } catch (error) {
        res.status(500).json({
            ok: false ,
            msg: 'Hable con el administrador error al obtener los usuarios'
        })
    }
    
    
}

const get_Perfiles_Modulos = async ( req = request, res = response ) => {

    try {

        Promise.all(
            [ 
                await Perfil.findAll(
                    {
                        attributes : [
                            ['idPerfil', 'value'], ['descripcion', 'label' ] 
                        ]
                    }
                ),
                await Modulo.findAll({
                    attributes : ['descripcion'],
                    include : [
                    {
                      model : Permiso, 
                      attributes : ['idpermiso','descripcion'],    
                      required: true
                    }
                ]
                })
            ]
        ). then( ( [ perfiles, modulos ] ) => {
            res.status(200).json({
                ok: true,
                perfiles,
                modulos
            })
        });
        
    } catch (error) {
        res.status(500).json({
            ok: false ,
            msg: 'Hable con el administrador error al obtener perfiles y modulos'
        }) 
    }
}

const getPermisos_Usuario = async( req = request, res = response ) => {
    try {
        const idusuario = req.params.idusuario;
        const permisos = await PermisosUsuarios.findAll( { where: { idUsuario: idusuario },
            attributes : ['idPermiso'],} ); 

        if ( !permisos ) {
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro los permisos del usuario'
            }); 
        } 

        const user_permisos = permisos.map(( p ) =>{
            return  p.idPermiso.toString();
         })

        res.status(200).json({
            ok: true,
            user_permisos
        })

    } catch (error) {
        res.status(500).json({
            ok: false ,
            msg: 'Hable con el administrador'
        }) 
    }
}


module.exports={
    loginUsuario,
    revalidarToken,
    getUsuarios,
    get_Perfiles_Modulos,
    getPermisos_Usuario
}