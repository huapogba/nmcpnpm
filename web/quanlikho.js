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
      const row = cell.closest('tr');

      // Cột số cần kiểm tra định dạng số: 1 (mức tối thiểu), 3 (số lượng hiện tại), 4 (số lượng cập nhật thêm), 5 (số lượng vừa xuất)
      if ([1, 3, 4, 5].includes(colIndex)) {
        if (isNaN(text) || text === '') {
          showAlert('❗ Vui lòng nhập đúng định dạng số cho ô số lượng!');
          return;
        }
      }

      // Nếu là ô "Số lượng cập nhật thêm" (colIndex 4): cộng vào "Số lượng hiện tại"
      if (colIndex === 4) {
        const updateValue = parseFloat(text);
        const currentCell = row.cells[3];
        const currentValue = parseFloat(currentCell.textContent.trim());

        if (!isNaN(currentValue) && !isNaN(updateValue)) {
          const newValue = currentValue + updateValue;
          currentCell.textContent = newValue;
          cell.textContent = ''; // reset ô cập nhật thêm

          saveRowToServer(row);
        }
      }

      // Nếu là ô "Số lượng vừa xuất" (colIndex 5): trừ đi từ "Số lượng hiện tại"
      if (colIndex === 5) {
        const exportValue = parseFloat(text);
        const currentCell = row.cells[3];
        const currentValue = parseFloat(currentCell.textContent.trim());

        if (!isNaN(currentValue) && !isNaN(exportValue)) {
          if (exportValue > currentValue) {
            showAlert('❗ Số lượng xuất vượt quá số lượng hiện tại!');
            return;
          }

          const newValue = currentValue - exportValue;
          currentCell.textContent = newValue;
          cell.textContent = ''; // reset ô số lượng vừa xuất

          saveRowToServer(row);
        }
      }

      // Cập nhật màu đỏ nếu số lượng hiện tại < mức tối thiểu
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

// Hàm lưu dữ liệu 1 dòng lên server
function saveRowToServer(row) {
  const tenNguyenLieu = row.cells[0].textContent.trim();
  const mucToiThieu = parseFloat(row.cells[1].textContent.trim());
  const donVi = row.cells[2].textContent.trim();
  const soLuongHienTai = parseFloat(row.cells[3].textContent.trim());

  if (!tenNguyenLieu || isNaN(mucToiThieu) || !donVi || isNaN(soLuongHienTai)) {
    showAlert('❗ Dữ liệu không hợp lệ, vui lòng kiểm tra lại!');
    return;
  }

  fetch('http://127.0.0.1:3000/api/kho', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenNguyenLieu,
      mucToiThieu,
      donVi,
      soLuongHienTai
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Lỗi server: ' + response.status);
    }
    return response.json();
  })
  .then(data => {
    showAlert(data.message || '✅ Đã lưu nguyên liệu vào kho!');
  })
  .catch(err => {
    showAlert('❌ Lỗi khi lưu dữ liệu!');
    console.error(err);
  });
}

// Thêm dòng mới
addRowBtn.addEventListener('click', () => {
  const newRow = table.insertRow();

  // Tạo 7 ô có thể nhập (tương ứng các cột bạn mô tả)
  for (let i = 0; i < 7; i++) {
    const cell = newRow.insertCell();
    // Các cột 6 là nút "Hủy nguyên liệu" nên không contentEditable, tạo nút ở đó
    if(i === 6) {
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'xóa';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => {
        deleteNguyenLieu(newRow);
      };
      cell.appendChild(deleteBtn);
    } else {
      cell.contentEditable = "true";
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

// Hàm tải danh sách nguyên liệu từ API và hiển thị lên bảng
async function loadNguyenLieu() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/kho');
    const data = await response.json();

    table.innerHTML = ''; // Xóa các dòng hiện tại

    data.forEach(item => {
      const newRow = table.insertRow();

      // Thêm các giá trị cho các cột 0 đến 4, ô số lượng vừa xuất để trống, ô cuối là nút xóa
      const values = [
        item.tenNguyenLieu,
        item.mucToiThieu,
        item.donVi,
        item.soLuongHienTai,
        '',  // Số lượng cập nhật thêm (cột 4)
        '',  // Số lượng vừa xuất (cột 5)
      ];

      for(let i = 0; i < 7; i++) {
        const cell = newRow.insertCell();
        if(i === 6) {
          // Nút xóa ở cột 6
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'xóa';
          deleteBtn.className = 'delete-btn';
          deleteBtn.onclick = () => deleteNguyenLieu(newRow);
          cell.appendChild(deleteBtn);
        } else {
          cell.contentEditable = "true";
          cell.textContent = values[i] || '';
          attachEnterSaveEvent(cell, i);
        }
      }

      // Kiểm tra màu cảnh báo nếu dưới mức tối thiểu
      const min = parseFloat(item.mucToiThieu);
      const current = parseFloat(item.soLuongHienTai);
      if (!isNaN(min) && !isNaN(current) && current < min) {
        newRow.cells[3].style.color = 'red';
        newRow.cells[3].style.fontWeight = 'bold';
      }
    });
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu:', err);
    showAlert('❌ Lỗi khi tải dữ liệu nguyên liệu!');
  }
}

// Gọi khi load trang
window.addEventListener('DOMContentLoaded', loadNguyenLieu);

// Xử lý nút xóa cho các dòng có sẵn
table.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const row = e.target.closest('tr');
    deleteNguyenLieu(row);
  }
});

// Gán sự kiện Enter cho các ô có sẵn khi trang đã load
document.querySelectorAll('#kho-table tbody tr').forEach(row => {
  row.querySelectorAll('td[contenteditable="true"]').forEach((cell, index) => {
    attachEnterSaveEvent(cell, index);
  });
});




