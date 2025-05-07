window.onload = function () {
    let employees = JSON.parse(localStorage.getItem('employees')) || [];
    let currentEmployeeIndex = -1; // Vị trí nhân viên trong mảng
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

    infoSection.style.display = 'none';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'none';

    // Tìm kiếm nhân viên
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchValue = searchInput.value.trim();

        const index = employees.findIndex(emp => emp.cccd === searchValue);
        if (index !== -1) {
            const found = employees[index];
            currentEmployeeIndex = index;

            nameField.innerText = found.name;
            dobField.innerText = found.dob;
            cccdField.innerText = found.cccd;
            addressField.innerText = found.address;
            phoneField.innerText = found.phone;
            emailField.innerText = found.email;
            positionField.innerText = found.position;
            statusField.innerText = found.status;

            infoSection.style.display = 'block';
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        } else {
            infoSection.style.display = 'none';
            editBtn.style.display = 'none';
            saveBtn.style.display = 'none';
            alert('Không tìm thấy nhân viên với số CCCD đã nhập.');
        }
    });

    // Chuyển sang chế độ sửa
    editBtn.addEventListener('click', function () {
        function makeEditable(cell) {
            const value = cell.innerText;
            cell.innerHTML = `<input type="text" value="${value}" />`;
        }

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

    // Lưu thông tin đã sửa
    saveBtn.addEventListener('click', function () {
        const updated = {
            ...employees[currentEmployeeIndex], // giữ lại CCCD
            name: nameField.querySelector('input').value.trim(),
            dob: dobField.querySelector('input').value.trim(),
            address: addressField.querySelector('input').value.trim(),
            phone: phoneField.querySelector('input').value.trim(),
            email: emailField.querySelector('input').value.trim(),
            position: positionField.querySelector('input').value.trim(),
            status: statusField.querySelector('input').value.trim()
        };

        employees[currentEmployeeIndex] = updated;
        localStorage.setItem('employees', JSON.stringify(employees));

        // Cập nhật lại giao diện
        nameField.innerText = updated.name;
        dobField.innerText = updated.dob;
        addressField.innerText = updated.address;
        phoneField.innerText = updated.phone;
        emailField.innerText = updated.email;
        positionField.innerText = updated.position;
        statusField.innerText = updated.status;

        // Hiển thị thông báo thành công
        const successMessage = document.getElementById('success-message');
        successMessage.style.display = 'block';

        // Ẩn thông báo sau 2 giây
        setTimeout(function () {
            successMessage.style.display = 'none';
        }, 2000);

        saveBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';
    });
};
