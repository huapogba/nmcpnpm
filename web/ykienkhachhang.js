window.onload = function () {
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

  feedbackForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('customer-email').value.trim();
    const content = document.getElementById('feedback-text').value.trim();
    const rating = parseInt(document.getElementById('rating').value);

    if (name && email && content && !isNaN(rating)) {
      try {
        const res = await fetch('http://localhost:3000/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, content, rating })
        });

        const data = await res.json();
        if (res.ok) {
          showMessage('✅ ' + data.message, true);
          feedbackForm.reset();
        } else {
          showMessage('❌ ' + data.message, false);
        }
      } catch (err) {
        showMessage('❌ Lỗi khi gửi dữ liệu lên server.', false);
        console.error(err);
      }
    } else {
      showMessage('❗ Vui lòng điền đầy đủ thông tin và chọn đánh giá.', false);
    }
  });
};




