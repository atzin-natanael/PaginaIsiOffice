import { Model, Op } from 'sequelize';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import fs from 'fs/promises'; // Al inicio de tu archivo
import path from 'path';
import nodemailer from 'nodemailer'
import cotizacion from '../models/Cotizacion.js'
import Clientes from '../models/Clientes.js'
import DescuentosClientes from '../models/DescuentosClientes.js'
import Usuario from '../models/Usuario.js';
const inicio = async (req, res) => {
    let { pagina = 1, termino = '', sort = 'CLAVE_ARTICULO', order = 'ASC', categoria = '' } = req.query;
    const {CLIENTE_ID} = req.usuario; // Asegúrate de que el cliente esté almacenado en la sesión
    const descuento = await DescuentosClientes.findOne({ where: { CLIENTE_ID: CLIENTE_ID } });
    termino = termino.toUpperCase();
    if (!pagina) pagina = 1;
    const expresion = /^[1-9]\d*$/;
    if (!expresion.test(pagina)) {
        return res.redirect(`/catalogo?pagina=1&termino=${termino}&categoria=${categoria}`);
    }
    try {
        console.log('API URL:',     process.env.API_URL);
        const respuesta = await fetch(`${process.env.API_URL}/codigos?pagina=${pagina}&categoria=${categoria}&termino=${termino}&sort=${sort}&order=${order}`);
        let datos = await respuesta.json();
        const arreglo = datos.datos;
        // 🔎 FILTRO
        // console.log(datos)
        // if (termino.trim()) {
        //     datos = datos.filter(c =>
        //         (c.NOMBRE ?? '').toString().includes(termino) ||
        //         (c.CLAVE_ARTICULO ?? '').toString().includes(termino)
        //     );

        // }
        // const limit = 25;
        //         const offset = (pagina - 1) * limit;

        //         const primeros = datos.slice(offset, offset + limit);

        const descuentocliente = Number(descuento.DESCUENTO) / 100;
        const codigosConTotal = arreglo.map(c => {

            const precioBase = parseFloat(c.PRECIO);
            const tasaImpuesto = parseFloat(c.IMPUESTO ?? 0) / 100;

            const precioConDescuento = precioBase * (1 - descuentocliente);
            const precioNeto = precioConDescuento * (1 + tasaImpuesto);

            return {
                ...c,
                precioLista: precioBase.toFixed(2),
                precioNeto: precioNeto.toFixed(2),
                ahorro: (precioBase - precioConDescuento).toFixed(2)
            };
        });
        res.render('catalogo', {
            pagina: 'Catálogo',
            barra: false,
            codigos: codigosConTotal,
            paginas: datos.paginas,
            paginaActual: datos.pagina,
            total: datos.total,
            offset: datos.offset,
            limit: datos.limit,
            usuario: req.usuario,
            termino // 🔥 importante
        });

    } catch (error) {
        console.log(error);
        res.render('catalogo', {
            pagina: 'Catálogo',
            barra: true,
            usuario: req.usuario,
            codigos: []
        });
    }
}
const crearCotizacion = async (req, res) => {
    let { pagina = 1, termino = '', sort = 'CLAVE_ARTICULO', order = 'ASC', categoria = '' } = req.query;
    const {CLIENTE_ID} = req.usuario; // Asegúrate de que el cliente esté almacenado en la sesión
    termino = termino.toUpperCase();
    console.log('categoria:', categoria);
    if (!pagina || !/^[1-9]\d*$/.test(pagina)) {
        return res.redirect(`/cotizacion/crear?pagina=1&termino=${termino}`);
    }
    
    const descuento = await DescuentosClientes.findOne({ where: { CLIENTE_ID: CLIENTE_ID } });
    try {
        const respuesta = await fetch(`${process.env.API_URL}/codigos?pagina=${pagina}&categoria=${categoria}&termino=${termino}&sort=${sort}&order=${order}`);
        let datos = await respuesta.json();
        const arreglo = datos.datos;
        // --- INICIO DE SINCRONIZACIÓN DEL CARRITO ---
        // Obtenemos lo que hay en sesión
        
        let carritoSesion = req.session.cotizacionNueva || [];

        const porcentajeDesc = Number(descuento.DESCUENTO) / 100;
        console.log('carrito', carritoSesion)
        // Mapeamos el carrito para actualizar existencia y precio con los "datos" frescos de la API
        carritoSesion = carritoSesion.map(item => {
    // 1. Datos base
        const enCatalogo = arreglo.find(d => d.ART_ID == item.ART_ID);
        
        // 2. Variables numéricas (Fallback a lo que ya hay en sesión si no está en el catálogo visible)
        const precioBase = Number(enCatalogo ? enCatalogo.PRECIO : (item.PRECIO || 0));
        // Asumimos que si viene de la DB o API, '16.00' es el porcentaje
        const tasaImpuesto = Number(enCatalogo ? enCatalogo.IMPUESTO : (item.TASA_IVA || 16)) / 100;
        const cantidad = Number(item.CANTIDAD || item.cantidad || 0);

        // 3. CÁLCULOS EN PESOS
        const precioConDescuento = precioBase * (1 - porcentajeDesc);
        const descuento = (cantidad * precioBase) * (porcentajeDesc);
        const montoImpuestoPesos = (precioConDescuento * tasaImpuesto) * cantidad; // Valor en dinero
        const importeTotalFinal = (precioConDescuento * (1 + tasaImpuesto)) * cantidad;
        console.log(porcentajeDesc, precioConDescuento, importeTotalFinal)
        // 4. Retorno del objeto con IMPUESTO en pesos
        return {
            ...item,
            ART_ID: item.ART_ID,
            CLAVE_ARTICULO: item.CLAVE_ARTICULO,
            NOMBRE: item.NOMBRE,
            PRECIO: precioBase, 
            CANTIDAD: cantidad,
            
            // --- CAMBIOS AQUÍ ---
            TASA_IVA: (tasaImpuesto * 100).toFixed(2), // Guardamos la tasa por si acaso
            IMPUESTO: montoImpuestoPesos.toFixed(2),   // <--- VALOR EN PESOS (monto total de IVA)
            PRECIO_DESCUENTO: precioConDescuento.toFixed(2), 
            DESCUENTO: descuento.toFixed(2),
            IMPORTE: (precioBase * cantidad).toFixed(2),
            IMPORTE_TOTAL: importeTotalFinal.toFixed(2),
            // --------------------
            
            EXISTENCIA: enCatalogo ? (Number(enCatalogo.EXISTENCIA_A) + Number(enCatalogo.EXISTENCIA_T)) : (item.EXISTENCIA || 0)
        };
    });
    
    // Guardamos el carrito actualizado de nuevo en la sesión
    req.session.cotizacionNueva = carritoSesion;
    // --- FIN DE SINCRONIZACIÓN ---
    const totalCot = carritoSesion.reduce((acc, item) => acc + Number(item.IMPORTE_TOTAL || 0), 0);
    console.log('importe total', totalCot)
        // if (termino.trim()) {
        //     datos = datos.filter(c =>
        //         (c.NOMBRE ?? '').toString().includes(termino) ||
        //         (c.CLAVE_ARTICULO ?? '').toString().includes(termino)
        //     );
        // }
        
        // const limit = 25;
        // const offset = (pagina - 1) * limit;
        // const primeros = datos.slice(offset, offset + limit);
        const descuentocliente = Number(descuento.DESCUENTO) / 100;
        const codigosConTotal = arreglo.map(c => {
            // Convertimos los strings del fetch a números reales
            const precioBase = parseFloat(c.PRECIO); 
            const tasaImpuesto = parseFloat(c.IMPUESTO) / 100;
            
            // FÓRMULA: (Precio Base - Descuento) + IVA
            // Es lo mismo que: PrecioBase * (1 - Desc) * (1 + IVA)
            const precioConDescuento = precioBase * (1 - descuentocliente);
            const precioNeto = precioConDescuento * (1 + tasaImpuesto);

            return {
                ...c,
                TOTAL_EXISTENCIA: Number(c.EXISTENCIA_A) + Number(c.EXISTENCIA_T),
                // Preparamos los valores para la vista
                precioLista: precioBase.toFixed(2),
                PRECIO: precioNeto.toFixed(2), // Este es el que el cliente paga
                PRECIO_DESCUENTO: precioConDescuento.toFixed(2),
                ahorro: (precioBase - precioConDescuento).toFixed(2)
            };
        });
        
        // Calculamos el total con los datos ya actualizados
        
        res.render('cotizacion/crear', {
            pagina: 'Crear Cotización',
            barra: false,
            codigos: codigosConTotal,
            paginas: datos.paginas,
            paginaActual: datos.pagina,
            total: datos.total,
            offset: datos.offset,
            limit: datos.limit,
            termino: termino,
            cotizacion: carritoSesion, // Pasamos el carrito sincronizado
            totalCot: totalCot.toFixed(2)
        });
        
    } catch (error) {
        console.log("Error en crearCotizacion:", error);
        res.render('cotizacion/crear', {
            pagina: 'Crear Cotización',
            barra: false,
            codigos: [],
            cotizacion: [],
            totalCot: 0,
            paginaActual: 1,
            paginas: 0,
            total: 0,
            termino: ''
        });
    }
};
const agregarArticuloACotizacion = async (req, res) => {
    const { articuloId, CANTIDAD, termino } = req.body; // Asegúrate de que el cliente esté almacenado en la sesión
    console.log('**********************Agregar ART_ID:', req.body, 'Cantidad:', CANTIDAD, 'Término:', termino);
    const clienteId = req.usuario.CLIENTE_ID; // Asegúrate de que el cliente esté almacenado en la sesión
    const descuento = await DescuentosClientes.findOne({ where: { CLIENTE_ID: clienteId } });    
    const articuloAct = await fetch(`${process.env.API_URL}/codigos/${articuloId}`).then(res => res.json()).then(data => data[0]);
    console.log("Artículo actual:", articuloAct);
    console.log("Descuento encontrado:", descuento.DESCUENTO);
    if (!req.session.cotizacionNueva) {
        req.session.cotizacionNueva = [];
    }

    const respuesta = await fetch(`${process.env.API_URL}/codigos/${articuloId}`);
    const resultado = await respuesta.json(); // Esto es el [ { ... } ]

    // 1. Extraemos el primer elemento del arreglo
    const articulo = resultado[0]; 

    if (!articulo) {
        if(termino)
            res.redirect('/cotizacion/crear?termino='+ termino);
        else        
            res.redirect('/cotizacion/crear');
    }

    const existente = req.session.cotizacionNueva.find(i => i.ART_ID == articulo.ART_ID);
    const precioBase = Number(articulo.PRECIO);
    const porcentajeDesc = Number(descuento.DESCUENTO) / 100;
    const impuesto = Number(articulo.IMPUESTO) / 100;
    const precio = precioBase * (1 - porcentajeDesc) * (1 + impuesto);
    console.log("Agrega nuevo articulo con precio descontado:", precio);

    if (existente) {
        existente.CANTIDAD += Number(CANTIDAD);
    } else {
        // --- LA CLAVE ESTÁ AQUÍ ---
        req.session.cotizacionNueva.push({
            ART_ID: articulo.ART_ID,
            CLAVE_ARTICULO: articulo.CLAVE_ARTICULO,
            NOMBRE: articulo.NOMBRE,
            CANTIDAD: Number(CANTIDAD),
            PRECIO: Number(articulo.PRECIO), // VITAL: Guardar el precio base original
            TASA_IVA: Number(articulo.IMPUESTO || 16), // Guardamos la tasa (ej. 16)
            EXISTENCIA: Number(articulo.EXISTENCIA_A) + Number(articulo.EXISTENCIA_T)
        });
    }
    console.log('Término:', req.query);
    if(termino)
        res.redirect('/cotizacion/crear?termino='+ termino);
    else        
        res.redirect('/cotizacion/crear');
};
// const agregarEditandoArticuloACotizacion = async (req, res) => {
//     // 1. Extraemos el id de la cotización de la URL (si viene como parámetro) o del body
//     // Es vital que el formulario envíe el cotizacionId para no dejar el "19" fijo
//     const { articuloId, CANTIDAD, cotizacionId } = req.body; 
//     console.log(req.body);
//     console.log('prueba de id: ', cotizacionId);
//     //console.log('cotd ' , cotizacionId);
//     const clienteId = req.usuario.CLIENTE_ID;

//     try {
//         // 2. Obtener descuento con salvavidas (por si el cliente no tiene descuento asignado)
//         const descuentoDoc = await DescuentosClientes.findOne({ where: { CLIENTE_ID: clienteId } });
//         const porcentajeDesc = descuentoDoc ? (Number(descuentoDoc.DESCUENTO) / 100) : 0;

//         // 3. Obtener datos del artículo
//         const respuesta = await fetch(`${process.env.API_URL}/codigos/${articuloId}`);
//         const resultado = await respuesta.json();
//         const articulo = resultado[0];

//         if (!articulo) {
//             return res.redirect(`/cotizacion/editar/${cotizacionId}`);
//         }

//         // 4. Cálculos de precio (Precio Base -> Descuento -> Impuesto)
//         const precioBase = Number(articulo.PRECIO);
//         const tasaImpuesto = Number(articulo.IMPUESTO || 0) / 100;
        
//         // El precio neto que el cliente pagará por unidad
//         const precioCalculado = precioBase * (1 - porcentajeDesc) * (1 + tasaImpuesto);

//         // 5. Manejo de Sesión
//         if (!req.session.cotizacionEditar) {
//             req.session.cotizacionEditar = [];
//         }

//         const existente = req.session.cotizacionEditar.find(i => i.ART_ID == articulo.ART_ID);

//         if (existente) {
//             // Unificamos nombres: si en la DB es CANTIDAD, usamos CANTIDAD
//             existente.CANTIDAD = Number(existente.CANTIDAD || existente.CANTIDAD || 0) + Number(CANTIDAD);
//         } else {
//             req.session.cotizacionEditar.push({
//                 ART_ID: articulo.ART_ID,
//                 CLAVE_ARTICULO: articulo.CLAVE_ARTICULO,
//                 NOMBRE: articulo.NOMBRE,
//                 PRECIO: precioCalculado.toFixed(2), // Precio final con descuento e impuesto
//                 CANTIDAD: Number(CANTIDAD),
//                 IMPUESTO_TASA: tasaImpuesto,
//                 EXISTENCIA: Number(articulo.EXISTENCIA_A || 0) + Number(articulo.EXISTENCIA_T || 0)
//             });
//         }

//         // 6. Redirección dinámica al ID real de la cotización
//         res.redirect(`/cotizacion/editar/${cotizacionId}`);

//     } catch (error) {
//         console.error("Error al agregar artículo editando:", error);
//         res.redirect('/cotizaciones');
//     }
// };
const editarArticuloCotizacion = async (req, res) => {
    const { articuloId, CANTIDAD, cotizacionId } = req.body;
    
    if (!req.session.cotizacionEditar) {
        req.session.cotizacionEditar = [];
    }

    try {
        const respuesta = await fetch(`${process.env.API_URL}/codigos/${articuloId}`);
        const resultado = await respuesta.json();
        const articulo = resultado[0]; 

        if (!articulo) {
            return res.redirect(`/cotizacion/editar/${cotizacionId}`);
        }

        // Buscamos usando el estándar de MAYÚSCULAS
        const existente = req.session.cotizacionEditar.find(i => i.ART_ID == articulo.ART_ID);
        
        if (existente) {
            // Sumamos a la propiedad en mayúsculas
            existente.CANTIDAD = Number(existente.CANTIDAD || 0) + Number(CANTIDAD);
        } else {
            // Insertamos el nuevo objeto siguiendo el estándar de la DB
            req.session.cotizacionEditar.push({
                ART_ID: articulo.ART_ID,
                CLAVE_ARTICULO: articulo.CLAVE_ARTICULO,
                NOMBRE: articulo.NOMBRE,
                PRECIO: Number(articulo.PRECIO), // Guardar como número es vital
                CANTIDAD: Number(CANTIDAD),
                EXISTENCIA: Number(articulo.EXISTENCIA_A || 0) + Number(articulo.EXISTENCIA_T || 0),
                IMPUESTO: articulo.IMPUESTO,
            });
        }

        // Forzamos el guardado antes de redirigir para evitar que la sesión "se pierda" en el redirect
        req.session.save(() => {
            res.redirect(`/cotizacion/editar/${cotizacionId}`);
        });

    } catch (error) {
        console.error("Error al agregar artículo:", error);
        res.redirect(`/cotizacion/editar/${cotizacionId}?error=true`);
    }
};
// appController.js (Puerto 3001)
const vaciarCarritoSesion = (req, res) => {
    req.session.cotizacionNueva = []; // Limpiamos el arreglo de la sesión
    res.json({ ok: true });
};
const mostrarCotizaciones = async (req, res) => {
    const { id } = req.params;
    const estatus = req.query.estatus || 'PENDIENTE'; // Valor por defecto
    const usuario = req.usuario;
    console.log('mostrar cotizaciones de cliente:', usuario);
    const respuesta = await fetch(`${process.env.API_URL}/cotizaciones/${id}?estatus=${estatus}`);
    const cotizaciones = await respuesta.json(); // Esto es el [ { ... } ]
    const cliente = await Clientes.findOne({
        where: { CLIENTE_ID: id }
    });

    console.log("Cotizaciones encontradas:", cotizaciones);
    res.render('cotizacion/mostrar', {
        pagina: 'Mis Cotizaciones',
        barra: false,
        cotizaciones,
        usuario,
        cliente
    });
}
const editarCotizaciones = async (req, res) => {
    const { id } = req.params;
    const {CLIENTE_ID} = req.usuario;
    let { pagina = 1, termino = '', sort = 'CLAVE_ARTICULO', order = 'ASC' } = req.query;
    termino = termino.toUpperCase();
    const descuento = await DescuentosClientes.findOne({ where: { CLIENTE_ID: CLIENTE_ID } });
    try {
        // 1. Catálogo (Siempre se lee de la API para tener stock actualizado)
        const respCatalogo = await fetch(`${process.env.API_URL}/codigos?pagina=${pagina}&termino=${termino}&sort=${sort}&order=${order}`);
        let articulosCatalogo = await respCatalogo.json();
        const arreglo = articulosCatalogo.datos;
        const porcentajeDesc = Number(descuento.DESCUENTO) / 100;
        
        // --- LÓGICA DE SESIÓN VS DB ---
        // Solo cargamos de la DB si la sesión está vacía O si estamos editando una cotización DIFERENTE
        if (!req.session.cotizacionEditar || req.session.cotizacionIdActual !== id) {
            console.log("Cargando desde DB (Primera vez o cambio de ID)");
            
            const respDetalle = await fetch(`${process.env.API_URL}/cotizaciones/det/${id}`);
            const partidasDB = await respDetalle.json();
            console.log('articulos de la db a editar', partidasDB)
            // Guardamos en sesión tanto las partidas como el ID que estamos editando
            req.session.cotizacionEditar = partidasDB;
            req.session.cotizacionIdActual = id; 
            console.log('respuesta api',partidasDB);
        } else {
            console.log("Cargando desde SESIÓN (Manteniendo cambios temporales)");
        }
        console.log('carrito edits', req.session.cotizacionEditar)
        let partidasAMostrar = req.session.cotizacionEditar;
        partidasAMostrar = partidasAMostrar.map(item => {
    // 1. Datos base
        const enCatalogo = arreglo.find(d => d.ART_ID == item.ART_ID);
        
        // 2. Variables numéricas (Fallback a lo que ya hay en sesión si no está en el catálogo visible)
        const precioBase = Number(enCatalogo ? enCatalogo.PRECIO : (item.PRECIO || 0));
        // Asumimos que si viene de la DB o API, '16.00' es el porcentaje
        const tasaImpuesto = Number(enCatalogo ? enCatalogo.IMPUESTO : (item.TASA_IVA || 16)) / 100;
        const cantidad = Number(item.CANTIDAD || item.cantidad || 0);

        // 3. CÁLCULOS EN PESOS
        const precioConDescuento = precioBase * (1 - porcentajeDesc);
        const descuento = (cantidad * precioBase) * (porcentajeDesc);
        const montoImpuestoPesos = (precioConDescuento * tasaImpuesto) * cantidad; // Valor en dinero
        const importeTotalFinal = (precioConDescuento * (1 + tasaImpuesto)) * cantidad;

        // 4. Retorno del objeto con IMPUESTO en pesos
        return {
            ...item,
            ART_ID: item.ART_ID,
            CLAVE_ARTICULO: item.CLAVE_ARTICULO,
            NOMBRE: item.NOMBRE,
            PRECIO: precioBase, 
            CANTIDAD: cantidad,
            
            // --- CAMBIOS AQUÍ ---
            TASA_IVA: (tasaImpuesto * 100).toFixed(2), // Guardamos la tasa por si acaso
            IMPUESTO: montoImpuestoPesos.toFixed(2),   // <--- VALOR EN PESOS (monto total de IVA)
            PRECIO_DESCUENTO: precioConDescuento.toFixed(2), 
            DESCUENTO: descuento.toFixed(2),
            IMPORTE: (precioBase * cantidad).toFixed(2),
            IMPORTE_TOTAL: importeTotalFinal.toFixed(2),
            // --------------------
            
            EXISTENCIA: enCatalogo ? (Number(enCatalogo.EXISTENCIA_A) + Number(enCatalogo.EXISTENCIA_T)) : (item.EXISTENCIA || 0)
        };
    });
    console.log('partidas modificados: ', partidasAMostrar);
    console.log('carrito editando', req.session.cotizacionEditar)
    // 2. Ahora el reduce funcionará siempre apuntando a las MAYÚSCULAS
    req.session.cotizacionEditar = partidasAMostrar;
    
    const totalCot = partidasAMostrar.reduce((acc, item) => {
    // Sumamos directamente el IMPORTE_TOTAL que ya calculamos arriba
    return acc + Number(item.IMPORTE_TOTAL || 0);
    }, 0);
        //catalogo
        const codigosConTotal = arreglo.map(c => {
            // Convertimos los strings del fetch a números reales
            const precioBase = parseFloat(c.PRECIO); 
            const tasaImpuesto = parseFloat(c.IMPUESTO) / 100;
            
            // FÓRMULA: (Precio Base - Descuento) + IVA
            // Es lo mismo que: PrecioBase * (1 - Desc) * (1 + IVA)
            const precioConDescuento = precioBase * (1 - porcentajeDesc);
            const precioNeto = precioConDescuento * (1 + tasaImpuesto);

            return {
                ...c,
                TOTAL_EXISTENCIA: Number(c.EXISTENCIA_A) + Number(c.EXISTENCIA_T),
                // Preparamos los valores para la vista
                precioLista: precioBase.toFixed(2),
                precioNeto: precioNeto.toFixed(2), // Este es el que el cliente paga
                ahorro: (precioBase - precioConDescuento).toFixed(2)
            };
        });
        res.render('cotizacion/editar', {
            pagina: 'Editar Cotización',
            codigos: codigosConTotal,
            cotizacion: partidasAMostrar,
            paginas: articulosCatalogo.paginas,
            paginaActual: articulosCatalogo.pagina,
            total: articulosCatalogo.total,
            offset: articulosCatalogo.offset,
            limit: articulosCatalogo.limit,
            totalCot: totalCot.toFixed(2),
            id // ID de la cotización
        });

    } catch (error) {
        console.error("Error al cargar edición:", error);
        res.redirect('/cotizaciones');
    }
}
// Ejemplo de controlador para eliminar del "carrito" en sesión
const eliminarArticuloSesionEditar = async(req, res) => {
    console.log('BODY:', req.body);
    const { articuloId, cotizacionId } = req.body;
    console.log("Eliminar ART_ID:", articuloId, "de COTIZACION_ID:", cotizacionId);
    // Accedemos a la sesión
    let cotizacion = req.session.cotizacionNueva || [];

    // Sobreescribimos la sesión filtrando el ID que NO queremos
    req.session.cotizacionNueva = cotizacion.filter(
    item => Number(item.ART_ID) !== Number(articuloId)
    );

    // Redirigimos para refrescar la vista
    req.session.save(() => {
        // 3. Redirigir a la ruta exacta
        res.redirect(`/cotizacion/editar/${cotizacionId}`);
    });
}
const eliminarArticuloSesion = async(req, res) => {
    console.log('BODY:', req.body);
    const { articuloId, cotizacionId } = req.body;
    console.log("Eliminar ART_ID:", articuloId, "de COTIZACION_ID:", cotizacionId);
    // Accedemos a la sesión
    let cotizacion = req.session.cotizacionNueva || [];

    // Sobreescribimos la sesión filtrando el ID que NO queremos
    req.session.cotizacionNueva = cotizacion.filter(
    item => Number(item.ART_ID) !== Number(articuloId)
    );

    // Redirigimos para refrescar la vista
    req.session.save(() => {
        // 3. Redirigir a la ruta exacta
        res.redirect(`/cotizacion/crear?pagina=1&termino=`);
    });
}
const eliminarArticuloSesionEdit = async(req, res) => {
    console.log('BODY:', req.body);
    const { articuloId, cotizacionId } = req.body;
    console.log("Eliminar ART_ID:", articuloId, "de COTIZACION_ID:", cotizacionId);
    // Accedemos a la sesión
    let cotizacion = req.session.cotizacionEditar || [];

    // Sobreescribimos la sesión filtrando el ID que NO queremos
    req.session.cotizacionEditar = cotizacion.filter(
    item => Number(item.ART_ID) !== Number(articuloId)
    );

    // Redirigimos para refrescar la vista
    req.session.save(() => {
        // 3. Redirigir a la ruta exacta
        res.redirect(`/cotizacion/editar/${cotizacionId}`);
    });
}
const guardarCotizacionCompleta = async (req, res) => { // <--- Este 'res' es el bueno (Express)
    try {
        const articulos = req.session.cotizacionNueva;
        const usuario = req.usuario.CLIENTE_ID; 
        const {CLIENTE_ID} = req.usuario;
        console.log('articulos desde guaradar cotizacion', articulos)
        if (!articulos || articulos.length === 0) {
            return res.redirect('/cotizacion/carrito?error=vacio');
        }
        const descuento = await DescuentosClientes.findOne({ where: { CLIENTE_ID: usuario } });
        const descuentocliente = Number(descuento.DESCUENTO) / 100;
        const data = {
            "CLIENTE_ID": usuario,
            "COSTO_TOTAL": Number(articulos.reduce((t, a) => {
            // 1. Calculamos el importe base (Cantidad x Precio)
            const importeBruto = a.CANTIDAD * a.PRECIO;
            console.log('bruto',importeBruto)

            // 2. Aplicamos el descuento (1 - 0.30 = 0.70)
            const importeConDescuento = importeBruto * (1 - descuentocliente);
            
            // 3. Calculamos el IVA sobre ese valor rebajado (1 + 0.16 = 1.16)
            const totalConImpuesto = importeConDescuento + Number(a.IMPUESTO);
            return t + totalConImpuesto;
            }, 0).toFixed(2)),
            "DESCRIPCION": "Cotización desde la web",
            "DESCUENTO_CLIENTE": descuentocliente,
            "articulos": articulos
        };

        // CAMBIA 'const res' por 'const respuesta'
        const respuesta = await fetch(`${process.env.API_URL}/cotizacion/guardar`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Ahora usa 'respuesta' para todo lo que sigue
        const contentType = respuesta.headers.get("content-type"); 

        let result;
        if (contentType && contentType.includes("application/json")) {
            result = await respuesta.json();
        } else {
            const textError = await respuesta.text();
            throw new Error('Servidor devolvió HTML/Texto.');
        }

        if (req.session.cotizacionNueva)
            req.session.cotizacionNueva = [];

        // ¡AHORA SÍ! 'res' sigue siendo el objeto original de Express
        return res.render('cotizacion/exito', {
            pagina: 'Cotización Guardada',
            usuario: req.usuario,
            mensaje: '¡Tu cotización ha sido guardada exitosamente!'
        });

    } catch (err) {
        console.error('Error en el servidor:', err);
        // Aquí también usa el 'res' original
        return res.render('templates/mensaje', {
            pagina: 'Hubo un problema al guardar la cotización.'
        });
    }
}
//last problems
const guardarCotizacionEditando = async (req, res) => { // <--- Este 'res' es el bueno (Express)
    const {cotizacionId} = req.body;
    try {
        const articulos = req.session.cotizacionEditar;
        const usuario = req.usuario.CLIENTE_ID; 
        console.log('guardar editando', articulos)
        if (!articulos || articulos.length === 0) {
            return res.redirect('/cotizacion/carrito?error=vacio');
        }

        const data = {
            "CLIENTE_ID": usuario,
            "COSTO_TOTAL": Number(articulos.reduce((t, a) => t + Number(a.IMPORTE_TOTAL), 0).toFixed(2)),
            "DESCRIPCION": "Cotización desde la web",
            "COTIZACION_ID": cotizacionId,
            "articulos": articulos
        };

        // CAMBIA 'const res' por 'const respuesta'
        const respuesta = await fetch(`${process.env.API_URL}/cotizacion/guardar-editando`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        // Ahora usa 'respuesta' para todo lo que sigue
        const contentType = respuesta.headers.get("content-type"); 

        let result;
        if (contentType && contentType.includes("application/json")) {
            result = await respuesta.json();
        } else {
            const textError = await respuesta.text();
            throw new Error('Servidor devolvió HTML/Texto.');
        }

        if (req.session.cotizacionEditar){
            req.session.cotizacionEditar = [];
            delete req.session.cotizacionEditar;
        }

        // ¡AHORA SÍ! 'res' sigue siendo el objeto original de Express
        return res.render('cotizacion/exito', {
            pagina: 'Cotización Actualizada',
            usuario: req.usuario,
            mensaje: '¡Tu cotización ha sido editada exitosamente!'
        });

    } catch (err) {
        console.error('Error en el servidor:', err);
        // Aquí también usa el 'res' original
        return res.render('templates/mensaje', {
            pagina: 'Hubo un problema al editar la cotización.'
        });
    }
}
const cancelarCotizacion = async (req, res) => {
    const { id } = req.params;
    try {
        console.log("Cancelando cotización ID:", id);

        // Especificamos el método POST y enviamos el CSRF si es necesario
        const respuesta = await fetch(`${process.env.API_URL}/cotizaciones/cancelar/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Si usas CSRF a nivel API, aquí iría el token
            }
        });

        // Verificamos si la respuesta es realmente JSON antes de parsear
        const contentType = respuesta.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const resultado = await respuesta.json();
            console.log("Respuesta de la API:", resultado);
        } else {
            // Si no es JSON, leemos el texto para ver qué error HTML mandó
            const textoError = await respuesta.text();
            console.error("El servidor respondió con algo que no es JSON (posible error 404 o 500 HTML)");
        }

        // Finalmente redireccionas
        res.redirect(`/cotizacion/mostrar/${req.usuario.CLIENTE_ID}?estatus=PENDIENTE`);

    } catch (error) {
        console.error("Error en el proceso de cancelación:", error);
        res.redirect(`/cotizacion/mostrar/${req.usuario.CLIENTE_ID}?error=true?estatus=CANCELADA`);
    }
}
const verCotizacion = async (req, res) => {
    const { id } = req.params;
    const { CLIENTE_ID } = req.usuario;
    
    try {
        const descuento = await DescuentosClientes.findOne({ where: { CLIENTE_ID: CLIENTE_ID } });
        // Si no hay descuento, usamos 0 para evitar errores
        const descuentocliente = descuento ? (Number(descuento.DESCUENTO) / 100) : 0;

        const respDetalle = await fetch(`${process.env.API_URL}/cotizaciones/det/${id}`);
        const partidasDB = await respDetalle.json();

        const partidasConCalculos = await Promise.all(partidasDB.map(async (item) => {
            const respArt = await fetch(`${process.env.API_URL}/codigos/${item.ART_ID}`);
            const dataArt = await respArt.json();
            const infoActual = dataArt[0];

            // --- CÁLCULOS MATEMÁTICOS (Sin redondear aún) ---
            const precioBase = Number(item.PRECIO);
            const cantidad = Number(item.CANTIDAD || 1); // Asegúrate de tener la cantidad
            const impuestoUnitario = Number(item.IMPUESTO || 0);

            // Precio con descuento aplicado + impuesto
            const precioUnitarioFinal = (precioBase * (1 - descuentocliente)) + impuestoUnitario;
            
            // Importe total de esta partida (Cantidad * Precio Final)
            const importeTotalPartida = precioUnitarioFinal * cantidad;

            return {
                ...item,
                // Guardamos los números para el cálculo del total general
                VALOR_NUMERICO_TOTAL: importeTotalPartida, 
                // Formateamos para la vista (esto es lo que verá el usuario)
                PRECIO_CON_DESCUENTO: precioUnitarioFinal.toFixed(2),
                IMPORTE_TOTAL: importeTotalPartida.toFixed(2),
                EXISTENCIA: infoActual ? (Number(infoActual.EXISTENCIA_A) + Number(infoActual.EXISTENCIA_T)) : 0,
            };
        }));

        // --- CÁLCULO DEL TOTAL GENERAL ---
        // Sumamos los valores numéricos, NO los strings de toFixed
        const totalCot = partidasConCalculos.reduce((acc, item) => acc + item.VALOR_NUMERICO_TOTAL, 0);

        return res.render('cotizacion/ver', {
            pagina: 'Ver Cotización',
            cotizacion: partidasConCalculos,
            totalCot: totalCot.toFixed(2), // Redondeamos solo al final para la vista
            id: id
        });

    } catch (error) {
        console.error("Error al cargar edición:", error);
        res.redirect('/cotizaciones');
    }
}
const enviarPdf = async(req, res)=>{
    const {id} = req.params;
    const {EMAIL, NOMBRE} = req.usuario;
    console.log('mail', EMAIL)
    try{
        const pdfDoc = await PDFDocument.create()
    
    // Embed the Times Roman font
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
        // Add a blank page to the document
        const page = pdfDoc.addPage()
        //imagen
        const logoPath = path.join(process.cwd(), 'public/uploads/logo.png');
        const logoBytes = await fs.readFile(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes); // Usa embedJpg si es .jpg

// Obtener dimensiones originales para escalar
        const anchoMax = 100;
        const altoMax = 100;
        const logoDims = logoImage.scaleToFit(anchoMax, altoMax); // Escala proporcionalmente
        // Get the width and height of the page
        const { width, height } = page.getSize()
        let yPosition = height - 50;
        // Draw a string of text toward the top of the page
        const fontSize = 30
        page.drawImage(logoImage, {
            x: 420, // Alineado a la izquierda
            y: yPosition - logoDims.height, // Lo bajamos de la coordenada Y inicial
            width: logoDims.width,
            height: logoDims.height,
        });

        // Ajustar yPosition para que el texto no se encime con el logo
        yPosition -= (logoDims.height + 20);
        //encabezado
        page.drawText(`COTIZACIÓN No. ${id}`, { x: 50, y: yPosition, size: 20, font: fontBold });
        yPosition -= 30;
        page.drawText(`Cliente: ${NOMBRE}`, { x: 50, y: yPosition, size: 12, font: fontRegular });
        yPosition -= 40;

        const respDetalle = await fetch(`${process.env.API_URL}/cotizaciones/det/${id}`);
        const partidasDB = await respDetalle.json();

        partidasDB.forEach(item => {
            // Si el texto es muy largo, lo cortamos (opcional)
            const nombreCorto = item.NOMBRE.substring(0, 60);

            page.drawText(`${item.CANTIDAD}`, { x: 50, y: yPosition, size: 9, font: fontRegular });
            page.drawText(nombreCorto, { x: 100, y: yPosition, size: 9, font: fontRegular });
            page.drawText(`$${item.IMPORTE_TOTAL}`, { x: 500, y: yPosition, size: 9, font: fontRegular });
            
            yPosition -= 15; // Bajamos para la siguiente fila

            // Control de salto de página simple (si te quedas sin espacio abajo)
            if (yPosition < 50) {
                // Aquí podrías agregar otra página, pero para pocas partidas está bien así
            }
        });

        const respuesta = await fetch(`${process.env.API_URL}/cotizaciones/edit/${id}`);
        const datosCot = await respuesta.json();
        
        const total = datosCot[0].COSTO_TOTAL;

        // 1. ESPACIO DESPUÉS DEL ÚLTIMO ARTÍCULO
        yPosition -= 20; 

        // 2. DIBUJAR LÍNEA DIVISORIA (Opcional, se ve más pro)
        page.drawLine({
            start: { x: 400, y: yPosition+20},
            end: { x: 550, y: yPosition +20},
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8)
        });

        // 3. PINTAR EL TOTAL
        // Usamos fontBold para que resalte
        page.drawText('TOTAL:', { 
            x: 400, 
            y: yPosition, 
            size: 12, 
            font: fontBold 
        });

        page.drawText(`$${total}`, { 
            x: 500, 
            y: yPosition, 
            size: 14, // Un poco más grande
            font: fontBold,
            color: rgb(0.88, 0.11, 0.28) // El rojo que te gusta
        });
        // 1. Bajamos un poco después del total
        yPosition -= 40;

        // 2. Definimos el texto del disclaimer
        // Usamos un array de strings si queremos controlar los saltos de línea manualmente
        const disclaimer = [
            "* Los precios están sujetos a cambios sin previo aviso. Incluyen Iva*",
            "* La disponibilidad de los artículos está sujeta a inventario al momento de la compra.",
            "* Algunos artículos podrían ser descontinuados por el fabricante o presentar retrasos en suministro."
        ];

        // 3. Dibujamos cada línea del disclaimer
        disclaimer.forEach(linea => {
            page.drawText(linea, {
                x: 50,
                y: yPosition,
                size: 8, // Fuente pequeña para que no robe atención
                font: fontRegular,
                color: rgb(0.4, 0.4, 0.4), // Gris oscuro profesional
            });
            yPosition -= 12; // Espacio entre líneas del disclaimer
        });

        // Serialize and Send...
        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save()
        //res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'inline; filename=previsualizacion.pdf');
        // res.send(Buffer.from(pdfBytes));

        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                // Esta línea permite conectar aunque el certificado no se pueda verificar
                rejectUnauthorized: false 
            }
         });
        await transport.sendMail({
            from: '"IsiOffice" <no-reply@papeleriacornejo.com>',
            to: EMAIL,
            subject: `Cotizacion ${id}`,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <p>Estimado ${NOMBRE},</p>
                    <p>Adjunto encontrará la <b>Cotización No. ${id}</b> solicitada en nuestro portal.</p>
                    <p>
                        <b>Vigencia:</b> 3 días naturales.<br>
                        <b>Disponibilidad:</b> Sujeta a inventario.
                    </p>
                    <p>Quedamos a sus órdenes para formalizar su pedido.</p>
                    <hr style="border:none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p>Atentamente,<br><b>Equipo IsiOffice</b></p>
                </div>
            `,
            attachments: [
                    {
                        filename: `cotizacion${id}.pdf`,
                        content: Buffer.from(pdfBytes), // Convertimos los bytes a Buffer
                        contentType: 'application/pdf'
                    }
                ]
        })
        return res.render('cotizacion/exito', {
            pagina: 'Enviado con éxito',
            usuario: req.usuario,
            mensaje: '¡Tu cotización ha sido enviada exitosamente!'
        });
    }catch (error) {
        console.log(error);
        res.status(500).send('Error al enviar el correo');
    }
}
const datosCotizacion = async (req, res) =>{
    const { id } = req.params;
    try {
        
        res.render('cotizacion/datosCotizacion', {
            pagina: 'Datos para generar pedido',
            barra: false,
            usuario: req.usuario,
            COTIZACION_ID: id
        });
    } catch (error) {
        console.error("Error al cargar datos para pedido:", error);
    }
}
const pedidoCrear = async (req, res) =>{
    const { id } = req.params;
    const usuario =  req.usuario.CLIENTE_ID;
    console.log('Datos para pedido***', req.body);

    const respDetalle = await fetch(`${process.env.API_URL}/cotizaciones/det/${id}`);
    const partidasDB = await respDetalle.json();
    console.log('partidas para pedido', partidasDB);
    const descuento = await DescuentosClientes.findOne({ where: { CLIENTE_ID: usuario } });
    const descuentocliente = Number(descuento.DESCUENTO) / 100;
    const data = {
            "CLIENTE_ID": usuario,
            "COTIZACION_ID": id,
            "METODO_PAGO": req.body.metodoPago,
            "FORMA_PAGO": req.body.formaPago,
            "USO_CFDI": req.body.usoCFDI,
            "COMENTARIOS": req.body.comentarios,
            "PORCENTAJE_DESCUENTO": descuento.DESCUENTO,
            "COSTO_TOTAL": Number(partidasDB.reduce((t, a) => {
            // 1. Calculamos el importe base (Cantidad x Precio)
            const importeBruto = a.CANTIDAD * a.PRECIO;
            console.log('bruto',importeBruto)

            // 2. Aplicamos el descuento (1 - 0.30 = 0.70)
            const importeConDescuento = importeBruto * (1 - descuentocliente);
            
            // 3. Calculamos el IVA sobre ese valor rebajado (1 + 0.16 = 1.16)
            const totalConImpuesto = importeConDescuento + Number(a.IMPUESTO);
            return t + totalConImpuesto;
            }, 0).toFixed(2)),
            "DESCRIPCION": "Cotización desde la web",
            "DESCUENTO_CLIENTE": descuentocliente,
            "articulos": partidasDB

        };
        console.log('datos para pedido *****¨**********', data);
        // CAMBIA 'const res' por 'const respuesta'
        const respuesta = await fetch(`${process.env.API_URL}/pedidos/guardar`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if(respuesta.ok){
            console.log('pedido creado con exito');
            const cerrar = await fetch(`${process.env.API_URL}/cotizaciones/cerrar/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // Si usas CSRF a nivel API, aquí iría el token
            }
            });
            const cerrado = await cerrar.json();
            if(cerrar.ok){
                console.log('cotizacion cerrada con exito');
            }else{
                console.error('Error al cerrar cotización:', cerrar.statusText);
            }

        } else 
            {
                console.error('Error al crear pedido:', respuesta.statusText);
        }

    console.log('datos para pedido cliente', req.usuario);
    return res.render('cotizacion/exitoPedido', {
            pagina: 'Pedido Creado',
            usuario: req.usuario,
            mensaje: '¡Tu pedido ha sido creado exitosamente!'
        });
}
const mostrarPedidos = async (req, res) => {
    const { id } = req.params;
    const usuario = req.usuario;
    console.log('mostrar pedidos de cliente:', usuario);
    const respuesta = await fetch(`${process.env.API_URL}/pedidos/${id}`);
    const pedidos = await respuesta.json(); // Esto es el [ { ... } ]
    const cliente = await Clientes.findOne({
        where: { CLIENTE_ID: id }
    });
    //console.log("Pedidos encontrados:", pedidos);
    res.render('pedido/mostrar', {
        pagina: 'Mis Pedidos',
        barra: false,
        pedidos,
        usuario,
        cliente
    });
}
export {
    inicio,
    crearCotizacion,
    agregarArticuloACotizacion,
    vaciarCarritoSesion,
    mostrarCotizaciones,
    editarCotizaciones,
    eliminarArticuloSesion,
    editarArticuloCotizacion,
    eliminarArticuloSesionEditar,
    guardarCotizacionCompleta,
    cancelarCotizacion,
    eliminarArticuloSesionEdit,
    guardarCotizacionEditando,
    verCotizacion,
    enviarPdf,
    datosCotizacion,
    pedidoCrear,
    mostrarPedidos
    //agregarEditandoArticuloACotizacion
}