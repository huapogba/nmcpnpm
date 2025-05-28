window.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('invoice-list');
  const searchInput = document.getElementById('search-input');
  let orderHistory = [];

  try {
    const response = await fetch('http://localhost:3000/api/orders1');
    if (!response.ok) throw new Error('Lỗi khi gọi API');
    orderHistory = await response.json();

    if (!Array.isArray(orderHistory) || orderHistory.length === 0) {
      container.innerHTML = '<p>Không có hóa đơn nào để hiển thị.</p>';
      return;
    }

    renderInvoices(orderHistory);
  } catch (error) {
    container.innerHTML = `<p>Lỗi tải dữ liệu: ${error.message}</p>`;
  }

  // Hàm hiển thị hóa đơn
 function renderInvoices(data) {
  container.innerHTML = '';
  data.forEach((order, index) => {
    console.log(order);  // kiểm tra dữ liệu order

    const invoiceBlock = document.createElement('div');
    invoiceBlock.className = 'invoice-block';
    invoiceBlock.id = `invoice-${index}`;

    const items = order.foodList?.split('\n').map(line => {
      return `<div class="invoice-item">${line}</div>`;
    }).join('') || '';

    invoiceBlock.innerHTML = `
      <div class="invoice-header" style="text-align: center;">
      <strong>BUG RESTAURANT</strong>
      </div>
      <div class="invoice-header" style="text-align: center;" >Chúc quý khách ngon miệng</div>

      <div class="invoice-header"><strong>Mã đơn:</strong> ${order.id || order.OrderID || order.OrderCode}</div>
      <div class="invoice-header"><strong>Ngày:</strong> ${order.date || order.OrderDate}</div>
      <div class="invoice-header"><strong>Trạng thái:</strong> ${order.status || order.Status}</div>
      <div class="invoice-header"><strong>Phương thức thanh toán:</strong> ${order.PaymentMethod}</div>
      <hr>
      <div><strong>Chi tiết đơn hàng:</strong></div>
      ${items}
      <div class="total"><strong>Tổng cộng: ${Number(order.total || order.Total).toLocaleString()} đ</strong></div>
      <button onclick="printInvoice('invoice-${index}')">🖨 In hóa đơn này</button>
    `;

    container.appendChild(invoiceBlock);
  });
}


  // Tìm kiếm theo mã đơn
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value.trim().toLowerCase();
      const filtered = orderHistory.filter(order => order.id.toLowerCase().includes(keyword));
      renderInvoices(filtered);
    });
  }
});

// In hóa đơn
function printInvoice(invoiceId) {
  const allBlocks = document.querySelectorAll('.invoice-block');
  allBlocks.forEach(block => block.classList.remove('printable'));

  const block = document.getElementById(invoiceId);
  if (block) {
    block.classList.add('printable');
    window.print();
    block.classList.remove('printable');
  }
}




