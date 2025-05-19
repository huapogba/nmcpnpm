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

function assignEmployee(cell) {
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

  assignments.push({ name, position });
  cell.dataset.assignments = JSON.stringify(assignments);
  updateCellDisplay(cell, assignments);
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

