// Feedback form functionality
const form = document.getElementById('feedback-form');
const ratingStars = document.querySelectorAll('.star-rating .star');
const ratingValue = document.getElementById('rating-value');

const stars = document.querySelectorAll('.star-rating .star');

stars.forEach(star => {
    star.addEventListener('click', function() {
        const value = parseInt(this.dataset.value);
        stars.forEach(s => s.classList.remove('selected'));
        this.classList.add('selected');
        for (let i = 0; i < value; i++) {
            stars[i].classList.add('selected');
        }
    });
});

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Show success message (simulated)
    alert(`¡Gracias, ${name}! Tu feedback ha sido enviado correctamente.\n\nEstaremos en contacto si necesitamos más información.`);

    form.reset();
    stars.forEach(s => s.classList.remove('selected'));
});

// Update rating display
function updateRatingDisplay(value) {
    for (let i = 0; i < value; i++) {
        stars[i].classList.add('selected');
    }
}