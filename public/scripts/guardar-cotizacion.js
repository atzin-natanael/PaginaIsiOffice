document.addEventListener('DOMContentLoaded', () => {
  // 1. PRIMERO definimos la variable
  const btn = document.getElementById('btnGuardarCotizacion');
  const usuario = document.getElementById('clienteId');
  if (!btn) return; // Si no existe el botón en esta página, no hacemos nada
  
  btn.addEventListener('click', async () => {
      // Ahora sí, btn ya está definido y podemos usarlo
      btn.disabled = true;
      btn.innerText = 'Guardando...';
      try {
        const articulos = [];
        document.querySelectorAll('.fila-articulo').forEach(fila => {
            articulos.push({
                "ART_ID": Number(fila.dataset.artId), 
                "CLAVE_ARTICULO": Number(fila.dataset.clave),
                "cantidad": Number(fila.querySelector('.cantidad').value),
                "precio": Number(fila.dataset.precio),
                "descuento": Number(fila.querySelector('.descuento').value) || 0,
                "impuesto": Number(fila.querySelector('.impuesto').value) || 0,
                "importe": Number(fila.querySelector('.importe').value) || 0
            });
        });
        const data = {
            "CLIENTE_ID": usuario ? usuario.value : null,
            "COSTO_TOTAL": Number(articulos.reduce((t, a) => t + (a.cantidad * a.precio), 0).toFixed(2)),
            "DESCRIPCION": "Cotización desde la web",
            "articulos": articulos
        };

        const csrfToken = document.getElementById('csrfToken')?.value;

        // DEBUG: Verifica si el token existe antes de enviar
        console.log('Enviando Token:', csrfToken);
        const token = 'token-prueba';
        // Cambia esto:
// const res = await fetch('http://localhost:3000/cotizacion/guardar', ...

        console.log(data)
// Por esto:
        const res = await fetch('http://localhost:3000/cotizacion/guardar', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'X-CSRF-Token': csrfToken // Solo si la API lo requiere
            },
            body: JSON.stringify(data)
        });



        // 2. Manejo de respuesta
        const contentType = res.headers.get("content-type");
        let result;

        if (contentType && contentType.includes("application/json")) {
            result = await res.json();
        } else {
            const textError = await res.text();
            console.error('Respuesta no JSON:', textError);
            throw new Error('Servidor devolvió HTML/Texto. Revisa la terminal de VS Code.');
        }

        if (!res.ok) throw result;
        // Cambia POST por GET
        await fetch('/cotizacion/vaciar-carrito', { method: 'GET' });
        
        // C. RECARGAR para que el PUG se renderice vacío
        
        window.location.reload();
        window.location.href = '/cotizacion/exito';
        // window.location.reload(); // Opcional: refrescar para limpiar

    } catch (err) {
        console.error('Error capturado:', err);
        alert('Error: ' + (err.mensaje || err.message || 'Error desconocido'));
    } finally {
        // ESTO SE EJECUTA SIEMPRE
        btn.disabled = false;
        btn.innerText = 'Guardar Cotización';
        console.log('Botón restablecido');
    }
  });
});