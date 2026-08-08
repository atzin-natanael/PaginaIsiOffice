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

document.addEventListener('DOMContentLoaded', () => {
        const modal = document.getElementById('previewModal');
        const img = document.getElementById('previewImg');
        const title = document.getElementById('previewTitle');
        const caja = document.getElementById('previewCaja');
        const closeBtn = document.getElementById('closePreview');

        // Escuchar clics en todos los botones de vista previa
        document.querySelectorAll('.btn-preview').forEach(btn => {
            btn.addEventListener('click', () => {
                const imgUrl = btn.dataset.img;
                const nombre = btn.dataset.nombre;
                const contenido = btn.dataset.caja;

                // Asignar los datos solo cuando se hace clic
                title.textContent = nombre;
                caja.textContent = contenido;
                img.src = imgUrl;

                // Si la imagen falla (no existe en el servidor), muestra un placeholder genérico
                img.onerror = () => {
                    img.src = '/uploads/productos/notfound.webp'; 
                };

                modal.classList.remove('hidden');
            });
        });

        // CERRAR MODAL
        const closeModal = () => modal.classList.add('hidden');
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    });