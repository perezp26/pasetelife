const { tipoRelleno, tipoCubierta, tipoCategoria } = require ("../models/indexDb")

const getCatalogosTipos = async(req, res) => {

try {
    const catalogoTiposPromise =  Promise.all([
        await tipoCategoria.findAll({
            attributes : [
                ['idTipoCategoria', 'value'],
                ['nombre','label'],
                'activo'
            ]
        }),
        await tipoRelleno.findAll({
            attributes : [
                ['idTipoRelleno', 'value'],
                ['nombre','label'],
                'activo'
            ]
        }),
        await tipoCubierta.findAll({
            attributes : [
                ['idTipoCubierta', 'value'],
                ['nombre','label'],
                'activo'
            ]
        })
    ]);
        const values = await catalogoTiposPromise;
        const [ categorias, rellenos, cubiertas ] = values;
        res.status(200).json({
            ok: true,
            data : { categorias , rellenos, cubiertas },
        })
    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }
   
}

 const addNewCategoria = async(req, res) =>{

    try {

        const categoria = await tipoCategoria.create({
            ...req.body
        })

        await categoria.save();

        res.status(200).json({
            ok: true,
            categoria,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }

}

const updateCategoria = async(req, res) => {
    try {

        const idTipoCategoria = req.params.idtipocategoria;
        
        const categoria = await tipoCategoria.findOne({ where: { idTipoCategoria } });
        if ( !categoria ) {
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro esa categoria'
            }); 
        } 

        const categoriaActualizada = await categoria.update( req.body );

        res.status(200).json({
            ok: true,
            categoriaActualizada
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }
}

const addNewCubierta = async(req, res) =>{

    try {

        const cubierta = await tipoCubierta.create({
            ...req.body
        })

        await cubierta.save();

        res.status(200).json({
            ok: true,
            cubierta,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }

}

const updateCubierta = async(req, res) => {
    try {

        const idTipoCubierta = req.params.idtipocubierta;
        
        const cubierta = await tipoCubierta.findOne({ where: { idTipoCubierta } });
        if ( !cubierta ) {
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro esa cubierta'
            }); 
        } 

        const cubiertaActualizada = await cubierta.update( req.body );

        res.status(200).json({
            ok: true,
            cubiertaActualizada
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }
}

const addNewRelleno = async(req, res) =>{

    try {

        const relleno = await tipoRelleno.create({
            ...req.body
        })

        await relleno.save();

        res.status(200).json({
            ok: true,
            relleno,
        })

    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }

}

const updateRelleno = async(req, res) => {
    try {

        const idTipoRelleno = req.params.idtiporelleno;
        
        const relleno = await tipoRelleno.findOne({ where: { idTipoRelleno } });
        if ( !relleno ) {
            return res.status(404).json({
                ok :false,
                msg: 'No se encontro ese relleno'
            }); 
        } 

        const rellenoActualizado = await relleno.update( req.body );

        res.status(200).json({
            ok: true,
            rellenoActualizado
        })
        
    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        })
    }
}

module.exports={
    addNewCategoria,
    addNewRelleno,
    addNewCubierta,
    getCatalogosTipos,
    updateCategoria,
    updateRelleno,
    updateCubierta
}