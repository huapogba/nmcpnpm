window.onload = async function () {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    let url = 'http://localhost:3000/api/orders';
    let options = {};

    if (user && user.chuc_vu === 'Khách hàng') {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token không tồn tại');
      options.headers = {
        'Authorization': 'Bearer ' + token
      };
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (data.success) {
      window.ordersCache = data.orders;
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
  const user = JSON.parse(localStorage.getItem('user'));

  // Kiểm tra quyền: chỉ cho phép 'Quản lý' hoặc 'Nhân viên chăm sóc khách hàng'
  if (!user || (user.chuc_vu !== 'Quản lí' && user.chuc_vu !== 'Nhân viên thu ngân')) {
    showNotification('Bạn không có quyền cập nhật phương thức thanh toán');
    // Đặt lại giá trị select về giá trị cũ (nếu muốn)
    const orders = window.ordersCache || [];
    const oldPayment = orders[index]?.PaymentMethod;
    if (oldPayment) selectEl.value = oldPayment;
    return;
  }

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
      showNotification('Cập nhật phương thức thanh toán thất bại');
    }
  } catch (error) {
    console.error(error);
    showNotification('Lỗi khi cập nhật phương thức thanh toán');
  }
}


async function updateStatus(index, selectEl) {
  const user = JSON.parse(localStorage.getItem('user'));

  // Kiểm tra quyền
  if (!user || (user.chuc_vu !== 'Quản lí' && user.chuc_vu !== 'Nhân viên bếp')) {
    showNotification('Bạn không có quyền cập nhật trạng thái đơn hàng');
    // Đặt lại giá trị select về giá trị cũ
    const orders = window.ordersCache || [];
    const oldStatus = orders[index]?.Status;
    if (oldStatus) selectEl.value = oldStatus;
    return;
  }

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
      showNotification('Cập nhật trạng thái thất bại');
    }
  } catch (error) {
    console.error(error);
    showNotification('Lỗi khi cập nhật trạng thái');
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

function showNotification(message, duration = 3000) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');

  setTimeout(() => {
    notification.classList.remove('show');
  }, duration);
}








