const admin = (req, res)=>{
    res.render('propiedades/admin',{
        pagina:'Mis Popiedades',
        barra: true
    })
}
export{
    admin
}