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
  cell.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const text = cell.textContent.trim();
      const row = cell.closest('tr');

      // Kiểm tra số hợp lệ ở các cột số
      if ([1, 3, 4, 5].includes(colIndex)) {
        const number = parseFloat(text);
        if (isNaN(number) || number <= 0) {
          showAlert('❗ Vui lòng nhập số hợp lệ lớn hơn 0!');
          return;
        }
      }

      // Xử lý cộng hoặc trừ số lượng hiện tại
      const updateOrExport = parseFloat(text);
      const currentCell = row.cells[3];
      const currentValue = parseFloat(currentCell.textContent.trim());

      if (colIndex === 4 && !isNaN(updateOrExport) && !isNaN(currentValue)) {
        currentCell.textContent = currentValue + updateOrExport;
        cell.textContent = '';
      } else if (colIndex === 5 && !isNaN(updateOrExport) && !isNaN(currentValue)) {
        if (updateOrExport > currentValue) {
          showAlert('❗ Số lượng xuất vượt quá số lượng hiện tại!');
          return;
        }
        currentCell.textContent = currentValue - updateOrExport;
        cell.textContent = '';
      }

      updateQuantityWarning(row);
      await saveRowToServer(row);
      cell.blur();
    }
  });
}

// Cảnh báo nếu số lượng dưới mức tối thiểu
function updateQuantityWarning(row) {
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
}

// Lưu nguyên liệu: nếu có rồi thì PUT, chưa có thì POST
async function saveRowToServer(row) {
  const tenNguyenLieu = row.cells[0].textContent.trim();
  const mucToiThieu = parseFloat(row.cells[1].textContent.trim());
  const donVi = row.cells[2].textContent.trim();
  const soLuongHienTai = parseFloat(row.cells[3].textContent.trim());

  if (!tenNguyenLieu || isNaN(mucToiThieu) || !donVi || isNaN(soLuongHienTai)) {
    showAlert('❗ Dữ liệu không hợp lệ, vui lòng kiểm tra lại!');
    return;
  }

  const exists = await checkIfRowExistsOnServer(tenNguyenLieu);

  const method = exists ? 'PUT' : 'POST';
  const url = exists ? 'http://127.0.0.1:3000/api/kho/update' : 'http://127.0.0.1:3000/api/kho';

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenNguyenLieu, mucToiThieu, donVi, soLuongHienTai })
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.message || 'Lỗi server');

    showAlert(data.message || (exists ? '✅ Đã cập nhật nguyên liệu!' : '✅ Đã thêm nguyên liệu!'));
  } catch (err) {
    showAlert('❌ Lỗi khi lưu dữ liệu!');
    console.error(err);
  }
}

// Kiểm tra nguyên liệu đã tồn tại chưa
async function checkIfRowExistsOnServer(tenNguyenLieu) {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/kho');
    const data = await res.json();
    return data.some(item => item.tenNguyenLieu === tenNguyenLieu);
  } catch (err) {
    console.error(err);
    return false;
  }
}

// Thêm dòng mới
addRowBtn.addEventListener('click', () => {
  const newRow = table.insertRow();
  for (let i = 0; i < 7; i++) {
    const cell = newRow.insertCell();
    if (i === 6) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'xóa';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => deleteNguyenLieu(newRow);
      cell.appendChild(deleteBtn);
    } else {
      cell.contentEditable = 'true';
      cell.textContent = '';
      attachEnterSaveEvent(cell, i);
    }
  }
});

// Xóa dòng
async function deleteNguyenLieu(row) {
  const tenNguyenLieu = row.cells[0].textContent.trim();

  try {
    const response = await fetch('http://127.0.0.1:3000/api/kho/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenNguyenLieu })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert(data.message || 'Đã xóa nguyên liệu!');
      row.remove();
    } else {
      showAlert('Lỗi: ' + (data.message || 'Không thể xóa nguyên liệu'));
    }
  } catch (error) {
    console.error(error);
    showAlert('Lỗi khi gọi API xóa nguyên liệu');
  }
}

// Load nguyên liệu từ server
async function loadNguyenLieu() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/kho');
    const data = await response.json();

    table.innerHTML = '';

    data.forEach(item => {
      const newRow = table.insertRow();
      const values = [
        item.tenNguyenLieu,
        item.mucToiThieu,
        item.donVi,
        item.soLuongHienTai,
        '',
        '',
      ];

      for (let i = 0; i < 7; i++) {
        const cell = newRow.insertCell();
        if (i === 6) {
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'xóa';
          deleteBtn.className = 'delete-btn';
          deleteBtn.onclick = () => deleteNguyenLieu(newRow);
          cell.appendChild(deleteBtn);
        } else {
          cell.contentEditable = 'true';
          cell.textContent = values[i] || '';
          attachEnterSaveEvent(cell, i);
        }
      }

      updateQuantityWarning(newRow);
    });
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu:', err);
    showAlert('❌ Lỗi khi tải dữ liệu nguyên liệu!');
  }
}

window.addEventListener('DOMContentLoaded', loadNguyenLieu);



