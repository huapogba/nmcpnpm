window.onload = function() {
    // Lắng nghe sự kiện gửi form
    const feedbackForm = document.getElementById('feedback-form');
    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Ngừng hành động mặc định của form

        // Lấy dữ liệu từ các input
        const name = document.getElementById('customer-name').value.trim();
        const email = document.getElementById('customer-email').value.trim();
        const content = document.getElementById('feedback-text').value.trim();
        const rating = document.getElementById('rating').value;

        // Kiểm tra dữ liệu đã đầy đủ chưa
        if (name && email && content) {
            // Tạo đối tượng feedback
            const newFeedback = { name, email, content, rating };

            // Lấy dữ liệu từ localStorage và thêm ý kiến mới vào mảng
            const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
            feedbacks.push(newFeedback);

            // Lưu lại mảng feedback vào localStorage
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

            // Thông báo cho người dùng
            alert('Cảm ơn bạn đã gửi ý kiến!');
        } else {
            alert('Vui lòng điền đầy đủ thông tin.');
        }
    });
};

