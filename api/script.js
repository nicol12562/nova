// API documentation functionality
const endpointCards = document.querySelectorAll('.endpoint-card');

endpointCards.forEach(card => {
    card.addEventListener('click', function() {
        const method = this.querySelector('.endpoint-method').textContent;
        const path = this.querySelector('code').textContent;

        alert(`Endpoint: ${method} ${path}\n\nEste endpoint está disponible para integración con tu aplicación.`);
    });
});

// Copy code block on click
const codeBlock = document.querySelector('.code-block');
if (codeBlock) {
    codeBlock.addEventListener('click', function() {
        const text = this.textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalBg = this.style.background;
            this.style.background = '#4ec9b0';
            setTimeout(() => {
                this.style.background = '';
            }, 500);
        });
    });
}