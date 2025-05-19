window.onload = function () {
  const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
  displayOrderHistory(history);
};

function displayOrderHistory(orders) {
  const tableBody = document.getElementById('order-history');
  tableBody.innerHTML = ''; // Xóa nội dung cũ trong bảng

  if (orders.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">Chưa có đơn hàng nào</td></tr>';
    return;
  }

  orders.forEach((order, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.id}</td>
      <td>${order.date}</td>
      <td>${Number(order.total).toLocaleString()} đ</td>
      <td>${order.foodList?.replaceAll('\n', '<br>') || ''}</td>
      <td>
        <select onchange="updatePayment(${index}, this)">
          <option value="Chưa thanh toán" ${order.payment === 'Chưa thanh toán' ? 'selected' : ''}>Chưa thanh toán</option>
          <option value="Tiền mặt" ${order.payment === 'Tiền mặt' ? 'selected' : ''}>Tiền mặt</option>
          <option value="Chuyển khoản" ${order.payment === 'Chuyển khoản' ? 'selected' : ''}>Chuyển khoản</option>
        </select>
      </td>
      <td>
        <select onchange="updateStatus(${index}, this)">
          <option value="Đang xử lý" ${order.status === 'Đang xử lý' ? 'selected' : ''}>Đang xử lý</option>
          <option value="Hoàn thành" ${order.status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
        </select>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function updateStatus(index, selectEl) {
  const newStatus = selectEl.value;
  const history = JSON.parse(localStorage.getItem('orderHistory')) || [];

  if (history[index]) {
    // Cập nhật giá trị trạng thái trong lịch sử
    history[index].status = newStatus;
    localStorage.setItem('orderHistory', JSON.stringify(history));
  }
}

function updatePayment(index, selectEl) {
  const newPayment = selectEl.value;
  const history = JSON.parse(localStorage.getItem('orderHistory')) || [];

  if (history[index]) {
    // Cập nhật giá trị phương thức thanh toán trong lịch sử
    history[index].payment = newPayment;
    localStorage.setItem('orderHistory', JSON.stringify(history));
  }
}

function filterOrders() {
  const keyword = document.getElementById('search-box').value.toUpperCase();
  const rows = document.querySelectorAll('#order-history tr');

  rows.forEach(row => {
    const orderId = row.children[0].textContent.toUpperCase();
    row.style.display = orderId.includes(keyword) ? '' : 'none';
  });
}








