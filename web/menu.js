// Dữ liệu menu ban đầu (có thể load từ API nếu cần)
const menuData = {
  starter: [],
  main: [],
  dessert: []
};

let currentCategory = '';
let isEditing = false;
let editIndex = null;

// Hiển thị section tương ứng khi bấm nút
function showMenu(category) {
  document.querySelectorAll('.menu-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(category).style.display = 'block';
  currentCategory = category;
  renderCategory(category);
}

// Vẽ lại danh sách món ăn của một category
function renderCategory(category) {
  const listEl = document.getElementById(`${category}-list`);
  listEl.innerHTML = '';
  menuData[category].forEach((dish, idx) => {
    const item = document.createElement('div');
    item.className = 'dish-item';
    item.innerHTML = `
      ${dish.img ? `<img src="${dish.img}" alt="${dish.name}" class="dish-img">` : ''}
      <div class="dish-info">
        <h3>${dish.name}</h3>
        <p>${dish.price.toLocaleString()} đ</p>
      </div>
      <div class="dish-buttons">
        <button class="add"    onclick="addToCart('${dish.name}', ${dish.price})">Thêm</button>
        <button class="edit"   onclick="openEditForm('${category}', ${idx})">Sửa</button>
        <button class="delete" onclick="openDeleteConfirm('${category}', ${idx})">Xóa</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

// Mở form để thêm hoặc sửa
function openAddForm(category) {
  currentCategory = category;
  isEditing = false;
  editIndex = null;
  document.getElementById('dish-name').value = '';
  document.getElementById('dish-price').value = '';
  document.getElementById('dish-img').value = '';
  document.getElementById('add-form').style.display = 'flex';
}

// Mở form với dữ liệu để sửa
function openEditForm(category, idx) {
  currentCategory = category;
  isEditing = true;
  editIndex = idx;
  const dish = menuData[category][idx];
  document.getElementById('dish-name').value = dish.name;
  document.getElementById('dish-price').value = dish.price;
  document.getElementById('dish-img').value = dish.img || '';
  document.getElementById('add-form').style.display = 'flex';
}

// Đóng form
function closeAddForm() {
  document.getElementById('add-form').style.display = 'none';
  isEditing = false;
  editIndex = null;
}

// Xử lý lưu dữ liệu từ form
function submitDish() {
  const name = document.getElementById('dish-name').value.trim();
  const price = parseInt(document.getElementById('dish-price').value, 10);
  const img = document.getElementById('dish-img').value.trim();

  if (!name || isNaN(price) || price <= 0) {
    alert('Vui lòng nhập tên và giá hợp lệ.');
    return;
  }

  const newDish = { name, price, img };

  if (isEditing && editIndex !== null) {
    menuData[currentCategory][editIndex] = newDish;
  } else {
    menuData[currentCategory].push(newDish);
  }

  closeAddForm();
  renderCategory(currentCategory);
}


// ======== GIỎ HÀNG =========
let cart = [];

// Thêm vào giỏ
function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
}

// Hiển thị giỏ hàng
function updateCartUI() {
  const tbody = document.getElementById('cart-items');
  tbody.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>
        <input type="number" min="1" value="${item.qty}"
          onchange="changeQuantity(${index}, this.value)">
      </td>
      <td>${(item.price * item.qty).toLocaleString()} đ</td>
      <td><button onclick="removeItem(${index})">Xóa</button></td>
    `;
    tbody.appendChild(row);
    total += item.price * item.qty;
  });

  document.getElementById('cart-total').innerText = `Tổng: ${total.toLocaleString()} đ`;
}

// Thay đổi số lượng
function changeQuantity(index, newQty) {
  const qty = parseInt(newQty, 10);
  cart[index].qty = qty > 0 ? qty : 1;
  updateCartUI();
}

// Xóa 1 món khỏi giỏ
function removeItem(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// Xác nhận đơn hàng
function confirmOrder() {
  const cartItems = getCartItems(); // Lấy danh sách món đã chọn từ giỏ hàng

  if (cartItems.length === 0) {
    document.getElementById('empty-cart-modal').style.display = 'block';
    return;
  }

  document.getElementById('order-confirmation').style.display = 'block';

  setTimeout(() => {
    document.getElementById('order-confirmation').style.display = 'none';
    document.getElementById('order-confirmed-modal').style.display = 'block';

    saveOrderToHistory(cartItems); // 
    clearCart(); // Xóa giỏ hàng sau khi xác nhận
  }, 1500);
}
function clearCart() {
  cart = [];
  updateCartUI();
}


// Đóng các modal
function closeModal() {
  document.getElementById('empty-cart-modal').style.display = 'none';
}

function closeOrderConfirmedModal() {
  document.getElementById('order-confirmed-modal').style.display = 'none';
}

function closeConfirm() {
  document.getElementById('confirm-delete').style.display = 'none';
}

// Khi load, hiển thị danh mục đầu tiên (nếu muốn)
window.addEventListener('DOMContentLoaded', () => {
  showMenu('starter');

  document.getElementById('delete-confirm-modal').style.display = 'none';
  document.getElementById('btn-delete-yes').addEventListener('click', () => {
    const { category, index } = deleteTarget;
    menuData[category].splice(index, 1);
    renderCategory(category);
    document.getElementById('delete-confirm-modal').style.display = 'none';
  });

  document.getElementById('btn-delete-no').addEventListener('click', () => {
    document.getElementById('delete-confirm-modal').style.display = 'none';
  });
});

// biến lưu tạm
let deleteTarget = { category: null, index: null };

// Hàm gọi khi bấm nút Xóa trên mỗi món
function openDeleteConfirm(category, idx) {
  deleteTarget = { category, index: idx };
  document.getElementById('delete-confirm-modal').style.display = 'flex';
}


function saveOrderToHistory(cartItems) {
  const history = JSON.parse(localStorage.getItem('orderHistory')) || [];
  const orderId = 'DH' + Date.now();
  const orderDate = new Date().toLocaleString('vi-VN');
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Tạo danh sách các món ăn: "Tên x Số lượng - Đơn giá - Thành tiền"
  const foodList = cartItems.map(item =>
    `${item.name} x ${item.quantity} - ${item.price.toLocaleString()} đ `
  ).join('\n');

  const newOrder = {
    id: orderId,
    date: orderDate,
    total: total,
    payment: '',
    status: 'Đang xử lý',
    foodList: foodList // Lưu đầy đủ tên, số lượng, đơn giá và thành tiền
  };

  history.push(newOrder);
  localStorage.setItem('orderHistory', JSON.stringify(history));
}




function getCartItems() {
  const rows = document.querySelectorAll('#cart-items tr');
  const items = [];

  rows.forEach(row => {
    const name = row.children[0].textContent;
    const quantity = parseInt(row.children[1].querySelector('input').value, 10);
    const priceText = row.children[2].textContent.replace(/[^\d]/g, '');
    const price = parseInt(priceText, 10);

    items.push({ name, quantity, price });
  });

  return items;
}
// thêm nguyên liệu 
function addIngredient() {
    const container = document.getElementById("ingredients-container");

    const div = document.createElement("div");
    div.className = "ingredient-input";

    div.innerHTML = `
        <input type="text" name="ingredient-name" placeholder="Tên nguyên liệu" />
        <input type="text" name="ingredient-amount" placeholder="Số lượng (VD: 100g)" />
        <button type="button" onclick="removeIngredient(this)">X</button>
    `;

    container.appendChild(div);
}

function removeIngredient(button) {
    const div = button.parentElement;
    div.remove();
}










