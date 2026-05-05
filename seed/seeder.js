import {exit} from 'node:process'
import usuarios from './usuarios.js'
import db from '../config/db.js'
import descuentosclientes from './descuentosclientes.js'
import {DescuentosClientes, Usuario} from '../models/index.js'
const importarDatos= async ()=>{
    try{
        //Auntenticar
        await db.authenticate()
        //Generar Columnas
        await db.sync()
        //Insertamos los datos
        await Promise.all([
            Usuario.bulkCreate(usuarios)
        ])
        console.log('Datos Importador Correctamente')
        exit(0)
    }catch(error){
        console.log(error)
        exit(1)
    }
}
const importarDescuento= async ()=>{
    try{
        //Auntenticar
        await db.authenticate()
        //Generar Columnas
        await db.sync()
        //Insertamos los datos
        await Promise.all([
            DescuentosClientes.bulkCreate(descuentosclientes)
        ])
        console.log('Datos Importados Correctamente')
        exit(0)
    }catch(error){
        console.log(error)
        exit(1)
    }
}
const eliminarDatos= async()=>{
    try{
        // await Promise.all([
        //     Propiedad.destroy({where:{}, truncate: true}),
        //     Categoria.destroy({where: {}, truncate: true}),
        //     Precio.destroy({where: {}, truncate: true})
        // ])
        await db.sync({force: true})
        console.log('Datos eliminados correctamente')
        exit(0)
    }catch(error){
        console.log(error)
        exit(1)
    }
}
if(process.argv[2]=== "-i"){
    importarDatos()
}
if(process.argv[2]=== "-e"){
    eliminarDatos()
}
if(process.argv[2]=== "-u"){
    importarDescuento()
}