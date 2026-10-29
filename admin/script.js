// Admin panel functionality
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// Simulate real-time stats update
function updateStats() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.addEventListener('click', function() {
            const statInfo = this.querySelector('.stat-info h3');
            const currentVal = parseInt(statInfo.textContent);
            statInfo.textContent = (currentVal + Math.floor(Math.random() * 5)).toString();
        });
    });
}

updateStats();