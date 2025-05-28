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
    const id = cell.id;

    if (id === 'position') {
        cell.innerHTML = `
            <select>
                <option value="Nhân viên phục vụ" ${value === 'Nhân viên phục vụ' ? 'selected' : ''}>Nhân viên phục vụ</option>
                <option value="Quản lí" ${value === 'Quản lí' ? 'selected' : ''}>Quản lí</option>
                <option value="Nhân viên thu ngân" ${value === 'Nhân viên thu ngân' ? 'selected' : ''}>Nhân viên thu ngân</option>
                <option value="Nhân viên bếp" ${value === 'Nhân viên bếp' ? 'selected' : ''}>Nhân viên bếp</option>
                <option value="Nhân viên kho" ${value === 'Nhân viên kho' ? 'selected' : ''}>Nhân viên kho</option>
                <option value="Nhân viên cskh" ${value === 'Nhân viên cskh' ? 'selected' : ''}>Nhân viên cskh</option>
            </select>`;
    } else if (id === 'status') {
        cell.innerHTML = `
            <select>
                <option value="Hoạt động" ${value === 'Hoạt động' ? 'selected' : ''}>Hoạt động</option>
                <option value="Đã nghỉ" ${value === 'Đã nghỉ' ? 'selected' : ''}>Đã nghỉ</option>
            </select>`;
    } else {
        cell.innerHTML = `<input type="text" value="${value}" />`;
    }
}


    // Lấy dữ liệu từ input khi lưu
    function getInputValue(cell) {
    const input = cell.querySelector('input');
    const select = cell.querySelector('select');

    if (input) return input.value.trim();
    if (select) return select.value.trim();
    return cell.innerText.trim();
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
        const sdt = searchInput.value.trim();

        if (sdt==='') {
            showMessage("Vui lòng nhập số SDT.", true);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/nhanvien/${sdt}`);
            if (!response.ok) {
                throw new Error("Không tìm thấy nhân viên với số SDT đã nhập.");
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
        console.log(updatedEmployee);

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
            const nv = result.nhanvien;

            // Cập nhật lại giao diện
            nameField.innerText = nv.ho_ten;
            dobField.innerText = (nv.ngay_sinh || '').split('T')[0];
            addressField.innerText = nv.dia_chi;
            phoneField.innerText = nv.sdt;
            emailField.innerText = nv.email;
            positionField.innerText = nv.chuc_vu;
            statusField.innerText = nv.trang_thai;

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


