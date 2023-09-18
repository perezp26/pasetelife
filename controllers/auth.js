const sequelize = require('sequelize');
const bcrypt = require('bcryptjs');
const db = require('../db/config');

const { Usuario, Permiso, Perfil, Modulo, PermisosUsuarios, Sucursal } = require("../models/indexDb");
const generarJWT = require('../helpers/generaJWT');
const generarId = require('../helpers/generarId');


const loginUsuario = async( req, res) => {

    try {
            const { usuario, password, sucursal } = req.body;
        
            const user = await Usuario.findOne({
                where: {
                    usuario : usuario
                },
                attributes : [  'idUsuario','nombre','usuario','password','idPerfil', 'idSucursal'],
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
            //   console.log( sucursal )
            //   console.log( user.dataValues );
                if ( user.idSucursal !== sucursal.value && user.idSucursal !== 0 ) {
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
                {
                  model: Perfil,
                  as: 'Perfil',
                  attributes : [ ['idPerfil', 'value'], 
                                 ['descripcion', 'label' ]
                               ],
                  required: true
                },
                {
                    model: Sucursal,
                    as: 'sucursal',
                    attributes : [
                                 ['idSucursal', 'value'], 
                                 ['nombre', 'label' ]
                    ]
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

const crearUsuario = async(req = request , res = response ) => {
    
    const { nombre,usuario, idPerfil,password,permisos, sucursal } = req.body;
    let transaction ;
    transaction =  await db.transaction();

    try {

        const existeUsuario = await Usuario.findOne({
            where: {
                usuario : usuario
            }
        })
        
        if (existeUsuario){
            return res.status(400).json({
                ok : false,
                msg: 'Ya existe un usuario con ese nombre ' + usuario
            })
        }
        const salt = bcrypt.genSaltSync();
        const passwordEncrypt = bcrypt.hashSync( password, salt );

        const user = await Usuario.create({
                nombre,
                usuario,
                idPerfil,
                password : passwordEncrypt,
                idSucursal : sucursal !== 0 && sucursal.value
            }, { transaction } );

             for( p in permisos){
                await PermisosUsuarios.create(
                            {
                                idpermiso_usuario : generarId(),
                                idPermiso : permisos[p],
                                idUsuario : user.idUsuario,
                                
                            }
                        ,{ transaction })

             }
            

        await transaction.commit();


        const token = await generarJWT(user.idUsuario, user.usuario, user.nombre, user.idPerfil, sucursal)

        res.status(201).json({
            ok:true,
                ok : true,
                user,
                token 
        })
        
    } catch (error) {
        if ( transaction ) await transaction.rollback();
        
        res.status(500).json({
            ok: false ,
            msg: 'Hable con el administrador'
        }) 
    }

}

const updateUsuario = async( req = request , res = response ) => {

    const idusuario = req.params.idusuario
    const { nombre, idPerfil, permisos, sucursal, idSucursal } = req.body;

    let transaction ;
    transaction =  await db.transaction()

    try {
        const usuarioUpdate = await Usuario.findOne({
            where: {
                idusuario : idusuario
            }
        })

        const user = await usuarioUpdate.update({
                nombre,
                idPerfil,
                idSucursal
            }, { transaction } );

            
            await PermisosUsuarios.destroy({
                     where : {
                        idUsuario : user.idUsuario
                     }
                 , transaction} 
            )
            
            for( p in permisos){
                await PermisosUsuarios.create(
                            {
                                idpermiso_usuario : generarId(),
                                idPermiso : permisos[p],
                                idUsuario : user.idUsuario,
                                
                            }
                        ,{ transaction })

             }
            

        await transaction.commit();

        //const token = await generarJWT(user.idUsuario, user.usuario, user.nombre, user.idPerfil, sucursal)

        res.status(201).json({
            ok:true,
            user,
            //token 
        })
        
    } catch (error) {
        if ( transaction ) await transaction.rollback();
        
        res.status(500).json({
            ok: false ,
            msg: 'Hable con el administrador, error al actualizar usuario'
        }) 
    }
}

const updatePassword = async( req, res ) => {
    const idUsuario = req.params.idusuario
    const { password } = req.body;

    try {
        const usuarioUpdate = await Usuario.findByPk( idUsuario );

        const salt = bcrypt.genSaltSync();
        const passwordEncrypt = bcrypt.hashSync( password, salt );

        const user = await usuarioUpdate.update({ password : passwordEncrypt });

        res.status(201).json({
            ok:true,
            msg:'Datos Guardados Correctamente',
            data: {
                ok : true,
                user }
        })
        
    } catch (error) {
        if ( transaction ) await transaction.rollback();
        
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
    getPermisos_Usuario,
    updateUsuario,
    crearUsuario,
    updatePassword
}