// Plan selection functionality
const planCards = document.querySelectorAll('.plan-card');

planCards.forEach(card => {
    card.addEventListener('click', function() {
        const planName = this.querySelector('h2').textContent;
        const price = this.querySelector('.price').textContent.trim();

        alert(`Has seleccionado el plan: ${planName} (${price})\n\n¡Gracias por tu interés en Planes!`);
    });
});