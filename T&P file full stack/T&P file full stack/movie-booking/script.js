const bookingForm = document.getElementById('bookingForm');
const seatCount = document.getElementById('seatCount');

bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const seats = Number(seatCount.value) || 1;
    const total = (seats * 12).toFixed(2);
    alert(`Booking confirmed for ${seats} seat${seats > 1 ? 's' : ''}. Total: $${total}`);
});