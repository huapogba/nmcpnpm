document.addEventListener('DOMContentLoaded', () => {
    // Modal Đăng ký
    const registerBtn = document.getElementById('register-btn');
    const registerModal = document.getElementById('register-modal');
    const registerClose = registerModal ? registerModal.querySelector('.close-btn') : null;

    // Modal Đổi mật khẩu
    const changePasswordBtn = document.getElementById('change-password-btn');
    const changePasswordModal = document.getElementById('change-password-modal');
    const changeClose = changePasswordModal ? changePasswordModal.querySelector('.close-btn') : null;

    // Form đăng nhập và cảnh báo
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');

    // Form đăng ký
    const registerForm = registerModal ? registerModal.querySelector('form') : null;

    // Form đổi mật khẩu
    const changePasswordForm = changePasswordModal ? changePasswordModal.querySelector('form') : null;

    // Mở/đóng modal đăng ký
    if (registerBtn && registerModal) {
        registerBtn.onclick = () => {
            registerModal.style.display = 'block';
        };
    }
    if (registerClose && registerModal) {
        registerClose.onclick = () => {
            registerModal.style.display = 'none';
        };
    }

    // Mở/đóng modal đổi mật khẩu
    if (changePasswordBtn && changePasswordModal) {
        changePasswordBtn.onclick = () => {
            changePasswordModal.style.display = 'block';
        };
    }
    if (changeClose && changePasswordModal) {
        changeClose.onclick = () => {
            changePasswordModal.style.display = 'none';
        };
    }

    // Đóng modal khi click ra ngoài
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };

    // Đóng modal cảnh báo khi nhấn nút ×
    window.closeAlert = function () {
        if (loginAlert) {
            loginAlert.style.display = 'none';
        }
    };

    // Kiểm tra và xử lý form đăng nhập
    if (loginForm && loginAlert) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = loginForm.elements['username'].value.trim();
            const password = loginForm.elements['password'].value.trim();
            const usernamePattern = /^\d{10}$/;
            const passwordPattern = /^[\x20-\x7E]+$/;

            if (!username || !password) {
                showAlert("Vui lòng nhập đầy đủ thông tin");
                return;
            }
            if (!usernamePattern.test(username)) {
                showAlert("Vui lòng nhập đúng số điện thoại");
                return;
            }
            if (!passwordPattern.test(password)) {
                showAlert("Vui lòng nhập đúng mật khẩu");
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone: username, password: password })
                });

                const data = await response.json();

                if (response.ok) {
                    showAlert(data.message || 'Đăng nhập thành công!');
                    // Ví dụ xử lý thêm:
                    // localStorage.setItem('user', JSON.stringify(data.user));
                    // window.location.href = "/dashboard.html";
                } else {
                    showAlert(data.error || 'Đăng nhập thất bại');
                }
            } catch (error) {
                showAlert('Lỗi kết nối server');
            }
        });
    }
    // Kiểm tra form đăng ký
        registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const phone = registerForm.elements['phone'].value.trim();
        const password = registerForm.elements['password'].value.trim();
        const phonePattern = /^\d{10}$/;
        const passwordPattern = /^[\x20-\x7E]+$/;

        if (!phone || !password) {
            showAlert("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (!phonePattern.test(phone)) {
            showAlert("Vui lòng nhập đúng số điện thoại");
            return;
        }
        if (!passwordPattern.test(password)) {
            showAlert("Vui lòng nhập đúng mật khẩu");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert(data.message || 'Đăng ký thành công!');
                // Có thể reset form hoặc đóng modal ở đây
                registerForm.reset();
                registerModal.style.display = 'none';
            } else {
                showAlert(data.error || 'Đăng ký thất bại');
            }
        } catch (error) {
            showAlert('Lỗi kết nối server');
        }
    });


    // Kiểm tra form đổi mật khẩu
   if (changePasswordForm && loginAlert) {
    changePasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const phone = changePasswordForm.elements['phone'].value.trim();
        const oldPassword = changePasswordForm.elements['MKC'].value.trim();
        const newPassword = changePasswordForm.elements['MKM'].value.trim();
        const confirmPassword = changePasswordForm.elements['XNMK'].value.trim();
        const phonePattern = /^\d{10}$/;
        const passwordPattern = /^[\x20-\x7E]+$/;

        if (!phone || !oldPassword || !newPassword || !confirmPassword) {
            showAlert("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (!phonePattern.test(phone)) {
            showAlert("Vui lòng nhập đúng số điện thoại");
            return;
        }
        if (!passwordPattern.test(oldPassword) || !passwordPattern.test(newPassword) || !passwordPattern.test(confirmPassword)) {
            showAlert("Vui lòng nhập đúng mật khẩu");
            return;
        }
        if (oldPassword === newPassword) {
            showAlert("Mật khẩu mới không được trùng với mật khẩu cũ");
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert("Xác nhận mật khẩu mới không khớp");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, oldPassword, newPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert(data.message || 'Đổi mật khẩu thành công!');
                changePasswordForm.reset();
                changePasswordModal.style.display = 'none';
            } else {
                showAlert(data.error || 'Đổi mật khẩu thất bại');
            }
        } catch (error) {
            showAlert('Lỗi kết nối server');
        }
    })}
});

// Hiển thị modal cảnh báo "Vui lòng điền đầy đủ thông tin!"
function showAlert(message) {
    var alert = document.getElementById('login-alert');
    alert.querySelector('h2').textContent = message; // Cập nhật thông điệp cảnh báo
    alert.style.display = 'block'; // Hiển thị modal thông báo

    // Tắt thông báo sau 3 giây
    setTimeout(function() {
        alert.style.display = 'none'; // Ẩn modal thông báo
    }, 3000);
}









