document.addEventListener('DOMContentLoaded', () => {
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

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn trình duyệt reload mặc định

    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const content = document.getElementById('feedback-text').value.trim();
    const ratingValue = document.getElementById('rating').value;
    const rating = parseInt(ratingValue);

    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

   if (!name || !email || !content || isNaN(rating)) {
    showMessage('Vui lòng điền đầy đủ thông tin và chọn đánh giá.', false);
    return;
    }

   if (!gmailRegex.test(email)) {
    showMessage('Email phải là địa chỉ @gmail.com hợp lệ.', false);
     return;
    }

  

    try {
      const res = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, content, rating })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('✅ ' + data.message, true);
        feedbackForm.reset();
      } else {
        showMessage('❌ ' + data.message, false); // Thông báo lỗi từ API (ví dụ: email sai)
      }
    } catch (error) {
      console.error('Lỗi gửi API:', error);
      showMessage('❌ Không thể kết nối với server.', false);
    }
  });
});








