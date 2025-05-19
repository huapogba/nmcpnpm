window.onload = function() {
    const feedbackForm = document.getElementById('feedback-form');
    const notification = document.getElementById('notification');

    function showMessage(message, isSuccess = true) {
        notification.textContent = message;
        notification.style.display = 'block';
        notification.style.backgroundColor = isSuccess ? '#d4edda' : '#f8d7da';
        notification.style.color = isSuccess ? '#155724' : '#721c24';
        notification.style.border = isSuccess ? '1px solid #c3e6cb' : '1px solid #f5c6cb';

        setTimeout(() => {
            notification.style.display = 'none';
            notification.textContent = '';
        }, 3000);
    }

    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('customer-name').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const content = document.getElementById('feedback-text').value.trim();
        const rating = document.getElementById('rating').value;
        const today = new Date().toLocaleDateString('vi-VN'); // ➤ Ngày gửi

        if (name && email && content) {
            const newFeedback = { name, email, content, rating, date: today };
            const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
            feedbacks.push(newFeedback);
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

            showMessage('✅ Cảm ơn bạn đã gửi ý kiến!', true);
            feedbackForm.reset();
        } else {
            showMessage('❗ Vui lòng điền đầy đủ thông tin.', false);
        }
    });
};



