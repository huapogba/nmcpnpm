const employeesByPosition = {
  nhanvien: ["Nguyễn Văn A", "Trần Thị B", "Lê Văn C"],
  baove: ["Bảo vệ 1", "Bảo vệ 2"],
  thuongtruc: ["Thường trực 1"]
};

function updateEmployeeList() {
  const position = document.getElementById("position").value;
  const employeeSelect = document.getElementById("employee");
  employeeSelect.innerHTML = '<option value="">-- Chọn tên --</option>';
  if (employeesByPosition[position]) {
    employeesByPosition[position].forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      employeeSelect.appendChild(option);
    });
  }
}

function getCurrentWeekDates() {
  const today = new Date();
  const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function generateScheduleTable() {
  const days = getCurrentWeekDates();
  const table = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = `<th>Ca</th>` + days.map(d => `<th>${d.toLocaleDateString("vi-VN", { weekday: "short", day: "numeric", month: "numeric" })}</th>`).join("");
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

  const container = document.getElementById("scheduleTable");
  container.innerHTML = ""; // clear old
  container.appendChild(table);
}

function assignEmployee(cell) {
  const name = document.getElementById("employee").value;
  const position = document.getElementById("position").value;
  if (!name || !position) {
    alert("Vui lòng chọn chức vụ và nhân viên.");
    return;
  }

  let assignments = JSON.parse(cell.dataset.assignments || "[]");

  // Kiểm tra trùng
  if (assignments.some(a => a.name === name)) {
    alert("Nhân viên này đã được phân công cho ca này.");
    return;
  }

  assignments.push({ name, position });
  cell.dataset.assignments = JSON.stringify(assignments);
  updateCellDisplay(cell, assignments);
}

function updateCellDisplay(cell, assignments) {
  cell.innerHTML = ""; // Clear old content
  assignments.forEach((a, index) => {
    const wrapper = document.createElement("div");
    wrapper.classList.add("employee-tag");

    const text = document.createElement("span");
    text.textContent = `${a.name} - ${formatPosition(a.position)}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.className = "remove-btn";
    removeBtn.onclick = (event) => {
      event.stopPropagation(); // Ngăn sự kiện assignEmployee
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

window.onload = generateScheduleTable;
