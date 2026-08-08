
document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const eyeIcon = document.querySelector('#eyeIcon');
    const eyeOffIcon = document.querySelector('#eyeOffIcon');

    togglePassword.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        
        // Alternar tipo de input
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        // Alternar visibilidad de los iconos
        eyeIcon.classList.toggle('hidden', isPassword);
        eyeOffIcon.classList.toggle('hidden', !isPassword);
    });
});