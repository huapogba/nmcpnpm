

async function updateEmployeeList() {
  const position = document.getElementById("position").value;
  const employeeSelect = document.getElementById("employee");
  employeeSelect.innerHTML = '<option value="">-- Chọn tên --</option>';

  if (!position) return;

  try {
    const res = await fetch(`http://127.0.0.1:3000/api/nhan-vien?chucVu=${encodeURIComponent(position)}`);
    if (!res.ok) throw new Error("Lỗi khi gọi API");

    const data = await res.json();
    data.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      employeeSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Lỗi khi load nhân viên:", err);
  }
}

function getCurrentWeekDates(offset = 0) {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + diff + offset * 7);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function generateScheduleTable(weekOffset = 0) {
  const days = getCurrentWeekDates(weekOffset);
  const table = document.createElement("table");
  table.classList.add("schedule-table");

  const header = document.createElement("tr");
  header.innerHTML = `<th>Ca</th>` + days.map(d =>
    `<th>${d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })}</th>`
  ).join("");
  table.appendChild(header);

  const shifts = ["Sáng", "Chiều"];

  shifts.forEach(shift => {
    const row = document.createElement("tr");
    row.innerHTML = `<td><strong>${shift}</strong></td>`;
    days.forEach(() => {
      const cell = document.createElement("td");
      cell.classList.add("assignable");
      cell.dataset.assignments = JSON.stringify([]);
      cell.onclick = () => assignEmployee(cell);
      row.appendChild(cell);
    });
    table.appendChild(row);
  });

  return table;
}

function showNotify(msg, duration = 2000) {
  const notify = document.getElementById("notify-message");
  notify.innerText = msg;
  notify.style.display = "block";

  setTimeout(() => {
    notify.style.display = "none";
  }, duration);
}

async function assignEmployee(cell) {
  const name = document.getElementById("employee").value;
  const position = document.getElementById("position").value;

  if (!name || !position) {
    showNotify("Vui lòng chọn chức vụ và nhân viên.");
    return;
  }

  let assignments = JSON.parse(cell.dataset.assignments || "[]");

  if (assignments.some(a => a.name === name)) {
    showNotify("Nhân viên này đã được phân công cho ca này.");
    return;
  }

  // Gọi API lấy nhan_vien_id từ tên
  const response = await fetch(`http://127.0.0.1:3000/api/nhanvien-id?name=${encodeURIComponent(name)}`);
  const data = await response.json();
  const nhan_vien_id = data.id;

  if (!nhan_vien_id) {
    showNotify("Không tìm thấy ID nhân viên.");
    return;
  }

  // Lấy ngày & ca từ vị trí của cell
  const ca = cell.parentElement.querySelector("td").innerText.trim(); // "Sáng" hoặc "Chiều"
  const thIndex = Array.from(cell.parentElement.children).indexOf(cell);
  const dateHeader = cell.closest("table").querySelector("tr").children[thIndex];
  const ngayText = dateHeader.innerText.trim(); // ví dụ: "T2 20/5"
  const parts = ngayText.match(/(\d{1,2})\/(\d{1,2})/);
  const today = new Date();
  const year = today.getFullYear();
  const ngay = `${year}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`; // YYYY-MM-DD

  // Gọi API để lưu lịch làm việc
  try {
    const saveRes = await fetch("http://127.0.0.1:3000/api/phancong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhan_vien_id, ngay, ca, chuc_vu: position })
    });

    const saveData = await saveRes.json();
    if (!saveData.success) {
      showNotify("Lỗi khi lưu phân công.");
      return;
    }

    // Nếu lưu thành công → cập nhật giao diện
    assignments.push({ name, position });
    cell.dataset.assignments = JSON.stringify(assignments);
    updateCellDisplay(cell, assignments);
    showNotify("Đã lưu phân công.");
  } catch (err) {
    console.error("Lỗi gọi API phân công:", err);
    showNotify("Lỗi mạng khi lưu phân công.");
  }
}


function updateCellDisplay(cell, assignments) {
  cell.innerHTML = "";
  assignments.forEach((a, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("employee-tag");

    const text = document.createElement("span");
    // Hiển thị tên và chức vụ đúng format
    text.textContent = `${a.name} - ${formatPosition(a.position)}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = (event) => {
      event.stopPropagation();
      removeAssignment(cell, index);
    };

    wrapper.appendChild(text);
    wrapper.appendChild(removeBtn);
    cell.appendChild(wrapper);
  });

  cell.classList.toggle("assigned", assignments.length > 0);
}


async function removeAssignment(cell, indexToRemove) {
  let assignments = JSON.parse(cell.dataset.assignments || "[]");
  const removed = assignments[indexToRemove];
  const name = removed.name;
  const position = removed.position;

  // Gọi API để lấy ID từ tên
  try {
    const response = await fetch(`http://127.0.0.1:3000/api/nhanvien-id?name=${encodeURIComponent(name)}`);
    const data = await response.json();
    const nhan_vien_id = data.id;

    if (!nhan_vien_id) {
      showNotify("Không tìm thấy ID nhân viên để xóa.");
      return;
    }

    // Lấy ngày & ca từ cell
    const ca = cell.parentElement.querySelector("td").innerText.trim(); // "Sáng" hoặc "Chiều"
    const thIndex = Array.from(cell.parentElement.children).indexOf(cell);
    const dateHeader = cell.closest("table").querySelector("tr").children[thIndex];
    const ngayText = dateHeader.innerText.trim(); // ví dụ: "T2 20/5"
    const parts = ngayText.match(/(\d{1,2})\/(\d{1,2})/);
    const today = new Date();
    const year = today.getFullYear();
    const ngay = `${year}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`; // YYYY-MM-DD

    // Gửi API để cập nhật trạng thái = 0
    const res = await fetch("http://127.0.0.1:3000/api/phancong", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nhan_vien_id, ngay, ca, trang_thai: 0 })
    });

    const result = await res.json();
    if (!result.success) {
      showNotify("Lỗi khi cập nhật trạng thái phân công.");
      return;
    }

    // Cập nhật giao diện
    assignments.splice(indexToRemove, 1);
    cell.dataset.assignments = JSON.stringify(assignments);
    updateCellDisplay(cell, assignments);
    showNotify("Đã xóa phân công.");

  } catch (err) {
    console.error("Lỗi khi xóa phân công:", err);
    showNotify("Lỗi khi xóa phân công.");
  }
}


function formatPosition(pos) {
  switch (pos) {
    case "Nhân viên phục vụ": return "Nhân viên phục vụ";
    case "Nhân viên thu ngân": return "Nhân viên thu ngân";
    case "Nhân viên bếp": return "Nhân viên bếp";
    case "Nhân viên kho": return "Nhân viên kho";
    case "Nhân viên cskh": return "Nhân viên cskh";
    default: return pos;
  }
}

async function loadAssignmentsForTable(weekOffset, table) {
  try {
    // Gửi ngày bắt đầu tuần theo định dạng YYYY-MM-DD để server trả dữ liệu tuần đó
    const days = getCurrentWeekDates(weekOffset);
    const startDate = days[0].toISOString().slice(0, 10);

    const res = await fetch(`http://127.0.0.1:3000/api/phancong?startDate=${startDate}`);
    if (!res.ok) throw new Error("Lỗi khi lấy dữ liệu phân công");

    const data = await res.json(); // giả sử data là mảng phân công { nhan_vien_id, name, chuc_vu, ngay, ca }

    data.forEach(a => {
      // Tìm cột tương ứng với ngày
      const headers = table.querySelectorAll("tr:first-child th");
      let colIndex = -1;
      for (let i = 1; i < headers.length; i++) {
        const headerText = headers[i].innerText.trim(); // ví dụ "T2 20/5"
        const parts = headerText.match(/(\d{1,2})\/(\d{1,2})/);
        if (!parts) continue;

        const today = new Date();
        const year = today.getFullYear();
        const headerDate = `${year}-${parts[2].padStart(2,'0')}-${parts[1].padStart(2,'0')}`;

        if (headerDate === a.ngay) {
          colIndex = i;
          break;
        }
      }
      if (colIndex === -1) return;

      // Tìm hàng tương ứng ca
      let rowIndex = -1;
      if (a.ca === "Sáng") rowIndex = 1;
      else if (a.ca === "Chiều") rowIndex = 2;
      if (rowIndex === -1) return;

      const row = table.rows[rowIndex];
      const cell = row.cells[colIndex];

      let assignments = JSON.parse(cell.dataset.assignments || "[]");
      assignments.push({ name: a.name, position: a.chuc_vu });
      cell.dataset.assignments = JSON.stringify(assignments);

      updateCellDisplay(cell, assignments);
    });
  } catch (err) {
    console.error("Lỗi load phân công:", err);
  }
}

window.onload = () => {
  const userStr = localStorage.getItem("user");
  let isManager = false;

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.chuc_vu === "Quản lí") {
        isManager = true;
      }
    } catch {
      console.warn("Lỗi parse user từ localStorage");
    }
  }

  const positionSelect = document.getElementById("position");
  const employeeSelect = document.getElementById("employee");
  const container = document.getElementById("scheduleTable");

  /*if (!isManager) {
    positionSelect.disabled = true;
    employeeSelect.disabled = true;
  }*/
 if (!isManager) {
    // Ẩn luôn các control chọn chức vụ và nhân viên
    positionSelect.style.display = "none";
    employeeSelect.style.display = "none";

    // Nếu có nhãn hoặc wrapper chứa thì cũng ẩn đi, ví dụ:
    const positionLabel = document.querySelector('label[for="position"]');
    const employeeLabel = document.querySelector('label[for="employee"]');
    if (positionLabel) positionLabel.style.display = "none";
    if (employeeLabel) employeeLabel.style.display = "none";
  }

  container.innerHTML = "";

  const weeks = [
    { offset: -1, title: "Tuần trước" },
    { offset: 0, title: "Tuần hiện tại" },
    { offset: 1, title: "Tuần sau" }
  ];

  weeks.forEach(async (week) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("week-schedule");

    const heading = document.createElement("h3");
    heading.textContent = week.title;
    wrapper.appendChild(heading);

    const table = generateScheduleTable(week.offset);

    if (!isManager) {
      const cells = table.querySelectorAll(".assignable");
      cells.forEach(cell => {
        cell.style.pointerEvents = "none";  // khóa click
        cell.title = "Chỉ quản lý mới được phân công nhân viên";
      });
    }

    wrapper.appendChild(table);
    container.appendChild(wrapper);

    loadAssignmentsForTable(week.offset, table);
  });

  if (isManager) {
    positionSelect.onchange = updateEmployeeList;
  }
};

