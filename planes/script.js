// Nova AI · Interacciones de selección de planes
document.addEventListener('DOMContentLoaded', () => {
  const planButtons = document.querySelectorAll('.plan-btn');

  planButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const plan = btn.getAttribute('data-plan');
      
      // Permitir que el botón de WhatsApp abra el enlace normalmente
      if (btn.classList.contains('btn-whatsapp')) {
        return;
      }

      if (plan === 'Pro') {
        alert('Actualmente te encuentras en el Plan Pro (2.500.000 tokens/mes).');
      } else if (plan === 'Gratis') {
        alert('Seleccionaste el Plan Gratis. Tu cuenta ya tiene acceso a las funciones básicas.');
      }
    });
  });
});