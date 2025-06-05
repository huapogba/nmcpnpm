

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

function removeAssignment(cell, indexToRemove) {
  let assignments = JSON.parse(cell.dataset.assignments || "[]");
  assignments.splice(indexToRemove, 1);
  cell.dataset.assignments = JSON.stringify(assignments);
  updateCellDisplay(cell, assignments);
}

function formatPosition(pos) {
  switch (pos) {
    case "nhanvien": return "Nhân viên";
    case "baove": return "Bảo vệ";
    case "thuongtruc": return "Thường trực";
    default: return pos;
  }
}

window.onload = () => {
  const container = document.getElementById("scheduleTable");
  container.innerHTML = "";

  // Tạo 3 bảng: tuần trước (-1), tuần hiện tại (0), tuần sau (+1)
  const weeks = [
    { offset: -1, title: "Tuần trước" },
    { offset: 0, title: "Tuần hiện tại" },
    { offset: 1, title: "Tuần sau" }
  ];

  weeks.forEach(week => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("week-schedule");

    const heading = document.createElement("h3");
    heading.textContent = week.title;
    wrapper.appendChild(heading);

    const table = generateScheduleTable(week.offset);
    wrapper.appendChild(table);

    container.appendChild(wrapper);
  });

  document.getElementById("position").onchange = updateEmployeeList;
};

