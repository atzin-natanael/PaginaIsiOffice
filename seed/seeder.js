import {exit} from 'node:process'
import usuarios from './usuarios.js'
import db from '../config/db.js'
<<<<<<< HEAD
import descuentosclientes from './descuentosclientes.js'
import {DescuentosClientes, Usuario} from '../models/index.js'
=======
import {Usuario} from '../models/index.js'
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
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
<<<<<<< HEAD
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
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
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
<<<<<<< HEAD
}
if(process.argv[2]=== "-u"){
    importarDescuento()
=======
>>>>>>> 93ef10cc365af59ee32899aa1355eac7c384d403
}