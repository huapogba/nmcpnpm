window.onload = function () {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-cccd');

    const infoSection = document.getElementById('employee-info');
    const nameField = document.getElementById('full-name');
    const dobField = document.getElementById('dob');
    const cccdField = document.getElementById('cccd');
    const addressField = document.getElementById('address');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const positionField = document.getElementById('position');
    const statusField = document.getElementById('status');

    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const successMessage = document.getElementById('success-message');

    infoSection.style.display = 'none';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'none';

    let currentEmployee = null; // lưu thông tin nhân viên hiện tại

    // Tạo input editable
    function makeEditable(cell) {
        const value = cell.innerText;
        cell.innerHTML = `<input type="text" value="${value}" />`;
    }

    // Lấy dữ liệu từ input khi lưu
    function getInputValue(cell) {
        const input = cell.querySelector('input');
        return input ? input.value.trim() : cell.innerText.trim();
    }

    // Hàm validate đơn giản (bạn có thể mở rộng)
    function isValid(data) {
        if (!data.ho_ten || !data.ngay_sinh || !data.dia_chi || !data.sdt || !data.email || !data.chuc_vu || !data.trang_thai) {
            return false;
        }
        const phonePattern = /^\d{10}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!phonePattern.test(data.sdt)) return false;
        if (!emailPattern.test(data.email)) return false;
        return true;
    }

    searchForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const cccd = searchInput.value.trim();

        if (!cccd) {
            showMessage("Vui lòng nhập số CCCD.", true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/nhanvien/${cccd}`);
            if (!response.ok) {
                throw new Error("Không tìm thấy nhân viên với số CCCD đã nhập.");
            }
            currentEmployee = await response.json();

            nameField.innerText = currentEmployee.ho_ten || '';
            dobField.innerText = (currentEmployee.ngay_sinh || '').split('T')[0];
            cccdField.innerText = currentEmployee.cccd || '';
            addressField.innerText = currentEmployee.dia_chi || '';
            phoneField.innerText = currentEmployee.sdt || '';
            emailField.innerText = currentEmployee.email || '';
            positionField.innerText = currentEmployee.chuc_vu || '';
            statusField.innerText = currentEmployee.trang_thai || '';

            infoSection.style.display = 'block';
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';

            showMessage('', false);

        } catch (error) {
            infoSection.style.display = 'none';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'none';
            showMessage(error.message, true);
        }
    });

    // Khi nhấn nút Edit: cho phép chỉnh sửa
    editBtn.addEventListener('click', function () {
        makeEditable(nameField);
        makeEditable(dobField);
        makeEditable(addressField);
        makeEditable(phoneField);
        makeEditable(emailField);
        makeEditable(positionField);
        makeEditable(statusField);

        editBtn.style.display = 'none';
        saveBtn.style.display = 'inline-block';
    });

    // Khi nhấn nút Save: gửi dữ liệu cập nhật về backend
    saveBtn.addEventListener('click', async function () {
        const updatedEmployee = {
            ho_ten: getInputValue(nameField),
            ngay_sinh: getInputValue(dobField),
            cccd: cccdField.innerText,  // CCCD không sửa
            dia_chi: getInputValue(addressField),
            sdt: getInputValue(phoneField),
            email: getInputValue(emailField),
            chuc_vu: getInputValue(positionField),
            trang_thai: getInputValue(statusField)
        };

        if (!isValid(updatedEmployee)) {
            showMessage("Vui lòng nhập đầy đủ và đúng định dạng thông tin.", true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/nhanvien/${updatedEmployee.cccd}`, {
                method: 'PUT',  // hoặc PATCH tùy bạn backend xử lý
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEmployee)
            });

            if (!response.ok) {
                throw new Error("Cập nhật thất bại.");
            }

            const result = await response.json();

            // Cập nhật lại giao diện
            nameField.innerText = result.ho_ten;
            dobField.innerText = (result.ngay_sinh || '').split('T')[0];
            addressField.innerText = result.dia_chi;
            phoneField.innerText = result.sdt;
            emailField.innerText = result.email;
            positionField.innerText = result.chuc_vu;
            statusField.innerText = result.trang_thai;

            showMessage("Cập nhật thành công!", false);

            saveBtn.style.display = 'none';
            editBtn.style.display = 'inline-block';

        } catch (error) {
            showMessage(error.message, true);
        }
    });

    function showMessage(message, isError) {
        successMessage.innerText = message;
        successMessage.style.color = isError ? 'red' : 'green';
        successMessage.style.display = message ? 'block' : 'none';

        if (message) {
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 2500);
        }
    }
};


