window.onload = function () {
    const form = document.getElementById('employee-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Ngăn chặn hành động gửi form mặc định

        // Lấy tất cả các trường input trong form
        const inputs = document.querySelectorAll('input[required], select[required]');
        let isValid = true;

        // Kiểm tra từng trường input
        inputs.forEach(input => {
            if (input.value.trim() === "") {
                isValid = false;
            }
        });

        // Nếu form không hợp lệ, không thực hiện hành động lưu và không hiển thị thông báo thành công
        if (!isValid) {
            return;
        } else {
            // Nếu form hợp lệ, tiến hành lưu thông tin
            const name = document.getElementById('fullname').value.trim();
            const dob = document.getElementById('dob').value.trim();
            const cccd = document.getElementById('cccd').value.trim();
            const address = document.getElementById('address').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const position = document.getElementById('position').value.trim();
            const status = document.getElementById('status').value.trim();

            const newEmployee = {
                name,
                dob,
                cccd,
                address,
                phone,
                email,
                position,
                status
            };

            let employees = JSON.parse(localStorage.getItem('employees')) || [];
            employees.push(newEmployee);
            localStorage.setItem('employees', JSON.stringify(employees));

            // Hiển thị thông báo thành công
            const successMessage = document.createElement('div');
            successMessage.classList.add('success-message');
            successMessage.innerText = 'Thông tin nhân viên đã được lưu thành công!';
            document.body.appendChild(successMessage);

            // Ẩn thông báo thành công sau 2 giây
            setTimeout(() => {
                successMessage.remove();
            }, 2000);

            // Reset form sau khi lưu thông tin
            form.reset();
        }
    });
};





