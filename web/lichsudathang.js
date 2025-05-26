window.onload = async function () {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/orders');
    const data = await response.json();
    if (data.success) {
      window.ordersCache = data.orders; // <-- cần thiết để updatePayment & updateStatus dùng được
      displayOrderHistory(data.orders);
    } else {
      displayOrderHistory([]);
    }
  } catch (error) {
    console.error('Lỗi lấy lịch sử đơn hàng:', error);
    displayOrderHistory([]);
  }
};



function displayOrderHistory(orders) {
  const tableBody = document.getElementById('order-history');
  tableBody.innerHTML = '';

  if (orders.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">Chưa có đơn hàng nào</td></tr>';
    return;
  }

  orders.forEach((order, index) => {
  const orderDate = new Date(order.OrderDate).toLocaleString('vi-VN');
  const isPaymentDisabled = order.PaymentMethod !== 'Chưa thanh toán';
  const isStatusDisabled = order.Status !== 'Đang xử lý';

  tableBody.innerHTML += `
    <tr>
      <td>${order.OrderCode}</td>
      <td>${orderDate}</td>
      <td>${Number(order.Total).toLocaleString()} đ</td>
      <td>${order.FoodList?.replaceAll('\n', '<br>') || ''}</td>
      <td>
        <select onchange="updatePayment(${index}, this)" ${isPaymentDisabled ? 'disabled' : ''}>
          <option value="Chưa thanh toán" ${order.PaymentMethod === 'Chưa thanh toán' ? 'selected' : ''}>Chưa thanh toán</option>
          <option value="Tiền mặt" ${order.PaymentMethod === 'Tiền mặt' ? 'selected' : ''}>Tiền mặt</option>
          <option value="Chuyển khoản" ${order.PaymentMethod === 'Chuyển khoản' ? 'selected' : ''}>Chuyển khoản</option>
        </select>
      </td>
      <td>
        <select onchange="updateStatus(${index}, this)" ${isStatusDisabled ? 'disabled' : ''}>
          <option value="Đang xử lý" ${order.Status === 'Đang xử lý' ? 'selected' : ''}>Đang xử lý</option>
          <option value="Hoàn thành" ${order.Status === 'Hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
        </select>
      </td>
    </tr>
  `;
});
}


async function updatePayment(index, selectEl) {
  const newPayment = selectEl.value;
  const orders = window.ordersCache || [];
  const orderCode = orders[index]?.OrderCode;

  if (!orderCode) return;

  try {
    const response = await fetch(`http://localhost:3000/api/orders/${orderCode}/payment`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMethod: newPayment })
    });

    const result = await response.json();
    if (!result.success) {
      alert('Cập nhật phương thức thanh toán thất bại');
    }
  } catch (error) {
    console.error(error);
    alert('Lỗi khi cập nhật phương thức thanh toán');
  }
}

async function updateStatus(index, selectEl) {
  const newStatus = selectEl.value;
  const orders = window.ordersCache || [];
  const orderCode = orders[index]?.OrderCode;

  if (!orderCode) return;

  try {
    const response = await fetch(`http://localhost:3000/api/orders/${orderCode}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    if (!result.success) {
      alert('Cập nhật trạng thái thất bại');
    }
  } catch (error) {
    console.error(error);
    alert('Lỗi khi cập nhật trạng thái');
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








