const table = document.getElementById('kho-table').getElementsByTagName('tbody')[0];
const addRowBtn = document.getElementById('add-row');
const alertDiv = document.getElementById('alert-message');

// Hiển thị thông báo
function showAlert(message) {
  alertDiv.textContent = message;
  alertDiv.style.display = 'block';
  setTimeout(() => {
    alertDiv.style.display = 'none';
    alertDiv.textContent = '';
  }, 3000);
}

// Gán sự kiện Enter để xử lý lưu và kiểm tra
function attachEnterSaveEvent(cell, colIndex) {
  cell.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = cell.textContent.trim();

      // Kiểm tra các cột phải là số
      if ([1, 3, 4].includes(colIndex)) {
        if (isNaN(text) || text === '') {
          showAlert('❗ Vui lòng nhập đúng định dạng số cho ô số lượng!');
          return;
        }
      }

      const row = cell.closest('tr');

      // Cộng dồn nếu nhập ở ô "Số lượng cập nhật thêm"
      if (colIndex === 4) {
        const updateValue = parseFloat(text);
        const currentCell = row.cells[3];
        const currentValue = parseFloat(currentCell.textContent.trim());

        if (!isNaN(currentValue)) {
          const newValue = currentValue + updateValue;
          currentCell.textContent = newValue;
        }
      }

      // Kiểm tra màu nếu thấp hơn mức tối thiểu
      const min = parseFloat(row.cells[1].textContent.trim());
      const current = parseFloat(row.cells[3].textContent.trim());
      if (!isNaN(min) && !isNaN(current)) {
        if (current < min) {
          row.cells[3].style.color = 'red';
          row.cells[3].style.fontWeight = 'bold';
        } else {
          row.cells[3].style.color = '';
          row.cells[3].style.fontWeight = '';
        }
      }

      cell.blur();
      console.log("Đã lưu:", cell.textContent);
    }
  });
}

// Thêm dòng mới
addRowBtn.addEventListener('click', () => {
  const newRow = table.insertRow();
  for (let i = 0; i < 5; i++) {
    const cell = newRow.insertCell();
    cell.contentEditable = "true";
    cell.textContent = '';
    attachEnterSaveEvent(cell, i);
  }

  const actionCell = newRow.insertCell();
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'xóa';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = () => table.deleteRow(newRow.rowIndex - 1);
  actionCell.appendChild(deleteBtn);
});

// Gán sự kiện xoá dòng
table.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const row = e.target.closest('tr');
    table.deleteRow(row.rowIndex - 1);
  }
});

// Gán sự kiện Enter cho các ô có sẵn
document.querySelectorAll('#kho-table tbody tr').forEach(row => {
  row.querySelectorAll('td[contenteditable="true"]').forEach((cell, index) => {
    attachEnterSaveEvent(cell, index);
  });
});





