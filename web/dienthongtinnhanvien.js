window.onload = function () {
    const form = document.getElementById('employee-form');
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Lấy dữ liệu từ form
        const newEmployee = {
            ho_ten: document.getElementById('fullname').value.trim(),
            ngay_sinh: document.getElementById('dob').value.trim(),
            cccd: document.getElementById('cccd').value.trim(),
            dia_chi: document.getElementById('address').value.trim(),
            sdt: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            chuc_vu: document.getElementById('position').value.trim(),
            trang_thai: document.getElementById('status').value.trim()
        };

        try {
            const res = await fetch('http://localhost:3000/api/nhanvien', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmployee)
            });

            const result = await res.json();

            if (res.ok) {
                showNotification(result.message || 'Thêm nhân viên thành công!', 'success');
                form.reset();
            } else {
                showNotification(result.error || 'Lỗi khi thêm nhân viên', 'error');
            }
        } catch (error) {
            showNotification('Lỗi kết nối server', 'error');
        }
    });

    function showNotification(msg, type) {
        notificationMessage.textContent = msg;
        notification.className = 'notification';
        if (type === 'success') notification.classList.add('success');
        else notification.classList.add('error');
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
};





















