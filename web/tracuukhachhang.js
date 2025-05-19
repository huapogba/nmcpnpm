// Dữ liệu mẫu tài khoản (có thể thay bằng localStorage hoặc gọi API)
const users = [
  { phone: "0901234567", role: "Khách hàng", password: "123" },
  { phone: "0934567890", role: "Khách hàng", password: "123" },
  { phone: "0912345678", role: "Khách hàng", password: "1234" }
];

// Khi trang tải xong thì hiển thị toàn bộ danh sách
window.onload = function () {
  displayUsers(users);
};

// Hiển thị danh sách người dùng
function displayUsers(userList) {
  const tbody = document.getElementById("accountList");
  tbody.innerHTML = "";

  if (userList.length === 0) {
    tbody.innerHTML = "<tr><td colspan='4' style='text-align:center;'>Không tìm thấy tài khoản nào.</td></tr>";
    return;
  }

  userList.forEach((user, index) => {
    const maskedPassword = "●".repeat(user.password.length);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td class="editable-phone">${user.phone}</td>
      <td>${maskedPassword}</td>
      <td>${user.role}</td>
    `;

    // Gắn sự kiện click để chỉnh sửa số điện thoại
    row.querySelector(".editable-phone").addEventListener("click", function () {
      editPhone(this, user);
    });

    tbody.appendChild(row);
  });
}

// Tìm kiếm theo số điện thoại
function searchUsers() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = users.filter(user =>
    user.phone.toLowerCase().includes(keyword)
  );
  displayUsers(filtered);
}

// Cho phép chỉnh sửa số điện thoại
function editPhone(cell, user) {
  const currentPhone = user.phone;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentPhone;
  input.style.width = "100%";

  input.addEventListener("blur", function () {
    savePhoneChange(this.value, user, cell);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      input.blur(); // Kích hoạt blur để lưu
    }
  });

  cell.innerHTML = "";
  cell.appendChild(input);
  input.focus();
}

// Lưu thay đổi số điện thoại
function showAlert(message) {
  const alertBox = document.getElementById("alertBox");
  alertBox.textContent = message;
  alertBox.classList.remove("hidden");

  // Ẩn sau 3 giây
  setTimeout(() => {
    alertBox.classList.add("hidden");
  }, 3000);
}

function savePhoneChange(newPhone, user, cell) {
  const trimmedPhone = newPhone.trim();
  const isValidPhone = /^\d{10}$/.test(trimmedPhone);

  if (!isValidPhone) {
    showAlert("Số điện thoại phải gồm đúng 10 chữ số.");
    cell.textContent = user.phone;
    cell.addEventListener("click", function () {
      editPhone(cell, user);
    });
    return;
  }

  user.phone = trimmedPhone;
  cell.textContent = user.phone;

  cell.addEventListener("click", function () {
    editPhone(cell, user);
  });
}



