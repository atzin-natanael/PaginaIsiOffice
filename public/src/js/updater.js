document.addEventListener('DOMContentLoaded', () => {
    // Escuchar cambios (flechitas o al presionar Enter / dar clic fuera)
    document.addEventListener('change', (e) => {
        if (e.target && e.target.classList.contains('input-cantidad')) {
            const form = e.target.closest('form.form-actualizar-cantidad');
            if (form) {
                form.submit();
            }
        }
    });

    // Enviar el formulario inmediatamente si el usuario presiona Enter mientras escribe
    document.addEventListener('keydown', (e) => {
        if (e.target && e.target.classList.contains('input-cantidad') && e.key === 'Enter') {
            const form = e.target.closest('form.form-actualizar-cantidad');
            if (form) {
                e.preventDefault(); // Evita envíos dobles o comportamientos extraños
                form.submit();
            }
        }
    });
});