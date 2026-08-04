document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    // Escuchar cualquier cambio en los inputs de cantidad dentro de nuestros formularios
    document.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('input-cantidad')) {
            const form = e.target.closest('form.form-actualizar-cantidad');
            if (form) {
                form.submit();
            }
        }
    });

    // Bloquear escritura directa en el teclado si quieres mantener solo las flechas
    document.addEventListener('keydown', (e) => {
        if (e.target && e.target.classList.contains('input-cantidad')) {
            e.preventDefault();
        }
    });
});