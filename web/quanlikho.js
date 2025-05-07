const table = document.getElementById('kho-table').getElementsByTagName('tbody')[0];
const addRowBtn = document.getElementById('add-row');

addRowBtn.addEventListener('click', () => {
  const newRow = table.insertRow();
  for (let i = 0; i < 5; i++) {
    const cell = newRow.insertCell();
    cell.contentEditable = "true";
    cell.textContent = '';
  }
  const actionCell = newRow.insertCell();
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '🗑️';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = () => table.deleteRow(newRow.rowIndex - 1);
  actionCell.appendChild(deleteBtn);
});

table.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const row = e.target.closest('tr');
    table.deleteRow(row.rowIndex - 1);
  }
});

