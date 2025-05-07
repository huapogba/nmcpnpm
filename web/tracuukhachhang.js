// Dữ liệu mẫu tài khoản (bạn có thể thay thế bằng dữ liệu thực từ localStorage hoặc API)
const users = [
    {  phone: "0901234567", role: "Khách hàng" , password: "123" },
    {  phone: "0934567890", role: "Khách hàng" , password: "123" },
    {  phone: "0912345678", role: "Khách hàng" , password: "1234" }
  ];
  
  // Hiển thị tất cả người dùng ban đầu
  window.onload = function () {
    displayUsers(users);
  };
  
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
        <td>${index + 1}</td> <!-- STT -->
        <td>${user.phone}</td>
        <td>${maskedPassword}</td>
        <td>${user.role}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
  
  function searchUsers() {
    const keyword = document.getElementById("searchInput").value.toLowerCase();
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    );
    displayUsers(filtered);
  }
  
