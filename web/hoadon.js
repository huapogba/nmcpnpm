window.addEventListener('DOMContentLoaded', () => {
  const orderHistory = JSON.parse(localStorage.getItem('orderHistory')) || [];
  const container = document.getElementById('invoice-list');

  if (orderHistory.length === 0) {
    container.innerHTML = '<p>Không có hóa đơn nào để hiển thị.</p>';
    return;
  }

  orderHistory.forEach((order, index) => {
    const invoiceBlock = document.createElement('div');
    invoiceBlock.className = 'invoice-block';
    invoiceBlock.id = `invoice-${index}`;

    const items = order.foodList?.split('\n').map(line => {
      return `<div class="invoice-item">${line}</div>`;
    }).join('') || '';

    invoiceBlock.innerHTML = `
      <div class="invoice-header"><strong>Mã đơn:</strong> ${order.id}</div>
      <div class="invoice-header"><strong>Ngày:</strong> ${order.date}</div>
      <div class="invoice-header"><strong>Trạng thái:</strong> ${order.status}</div>
      <hr>
      <div><strong>Chi tiết đơn hàng:</strong></div>
      ${items}
      <div class="total"><strong>Tổng cộng: ${Number(order.total).toLocaleString()} đ</strong></div>
      <button onclick="printInvoice('invoice-${index}')">🖨 In hóa đơn này</button>
    `;

    container.appendChild(invoiceBlock);
  });
});

function printInvoice(invoiceId) {
  const allBlocks = document.querySelectorAll('.invoice-block');
  allBlocks.forEach(block => block.classList.remove('printable'));

  const block = document.getElementById(invoiceId);
  if (block) {
    block.classList.add('printable');
    window.print();
    block.classList.remove('printable'); // reset sau khi in
  }
}


