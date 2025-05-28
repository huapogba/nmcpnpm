let users = [];

window.onload = async function () {
  await loadUsersFromServer();
  displayUsers(users);
};

async function loadUsersFromServer() {
  try {
    const res = await fetch("http://localhost:3000/api/users");
    if (!res.ok) throw new Error("Lỗi lấy dữ liệu người dùng");
    users = await res.json();
  } catch (error) {
    showAlert(error.message);
  }
}

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

    row.querySelector(".editable-phone").addEventListener("click", function () {
      editPhone(this, user);
    });

    tbody.appendChild(row);
  });
}

function searchUsers() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = users.filter(user =>
    user.phone.toLowerCase().includes(keyword)
  );
  displayUsers(filtered);
}






