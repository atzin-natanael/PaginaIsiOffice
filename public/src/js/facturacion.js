document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById('requiereFactura');
    const divFactura = document.getElementById('datosFactura');
    const btnNext = document.getElementById('btnNext');
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            divFactura.classList.remove('hidden'); // Muestra el div
            btnNext.classList.add('hidden');    // Muestra el botón
        } else {
            divFactura.classList.add('hidden');    // Oculta el div
            btnNext.classList.remove('hidden');       // Oculta el botón
        }
    });

    const metodoPago = document.querySelector('#metodoPago');
    const formaPago = document.querySelector('#formaPago');
    const usoCFDI = document.querySelector('#usoCFDI');

    function gestionarBloqueos() {
        if (metodoPago && metodoPago.value === 'PPD') {
            // BLOQUEAR Y ASIGNAR
            if(formaPago) {
                formaPago.value = '99';
                formaPago.disabled = true;
            }
            crearHidden('formaPago', '99');
            //crearHidden('usoCFDI', 'CP01');
        } else {
            const opcion99 = document.querySelector('select[name="formaPago"] option[value="99"]');
            if (opcion99) {
                opcion99.hidden = true; // O puedes usar: opcion99.style.display = 'none'; (dependiendo del navegador)
            }
            // DESBLOQUEAR Y LIMPIAR
            if(formaPago) {
                formaPago.disabled = false;
                // Si el valor era '99', lo regresamos a vacío para que elijan de nuevo
                if(formaPago.value === '99') formaPago.value = ''; 
            }
            if(usoCFDI) {
                usoCFDI.disabled = false;
                // Si el valor era 'CP01', lo regresamos a vacío
                if(usoCFDI.value === 'CP01') usoCFDI.value = '';
            }
            eliminarHidden('formaPago');
            eliminarHidden('usoCFDI');
        }
    }

    function crearHidden(nombre, valor) {
        let id = `hidden_${nombre}`;
        if(!document.getElementById(id)){
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = nombre;
            hidden.value = valor;
            hidden.id = id;
            const form = metodoPago.closest('form');
            if(form) form.appendChild(hidden);
        }
    }

    function eliminarHidden(nombre) {
        const hidden = document.getElementById(`hidden_${nombre}`);
        if(hidden) hidden.remove();
    }

    if(metodoPago) {
        metodoPago.addEventListener('change', gestionarBloqueos);
        gestionarBloqueos();
    }
});
