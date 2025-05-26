// Dữ liệu menu ban đầu
const menuData = {
  starter: [],
  main: [],
  dessert: []
};

let currentCategory = '';
let isEditing = false;
let editIndex = null;

// ======== HIỂN THỊ MENU ========

function showMenu(category) {
  document.querySelectorAll('.menu-section').forEach(sec => sec.style.display = 'none');
  document.getElementById(category).style.display = 'block';
  currentCategory = category;
  renderCategory(category);
}

function renderCategory(category) {
  const chucVu = JSON.parse(localStorage.getItem('user'))?.chuc_vu || '';
  const listEl = document.getElementById(`${category}-list`);
  listEl.innerHTML = '';
  menuData[category].forEach((dish, idx) => {
    const item = document.createElement('div');
    item.className = 'dish-item';

    // Nút Sửa và Xóa chỉ hiện khi là Quản lí
    const adminButtons = (chucVu === 'Quản lí') ? `
      <button class="edit" onclick="openEditForm('${category}', ${idx})">Sửa</button>
      <button class="delete" onclick="openDeleteConfirm('${category}', ${idx})">Xóa</button>
    ` : '';

    item.innerHTML = `
      ${dish.hinhAnh ? `<img src="${dish.hinhAnh}" alt="${dish.ten}" class="dish-img">` : ''}
      <div class="dish-info">
        <h3>${dish.ten}</h3>
        <p>${dish.gia.toLocaleString()} đ</p>
      </div>
      <div class="dish-buttons">
        <button class="add" onclick="addToCart('${dish.ten}', ${dish.gia})">Thêm</button>
        ${adminButtons}
      </div>
    `;
    listEl.appendChild(item);
  });
}

/*function renderCategory(category) {
  const listEl = document.getElementById(`${category}-list`);
  listEl.innerHTML = '';
  menuData[category].forEach((dish, idx) => {
    const item = document.createElement('div');
    item.className = 'dish-item';
    item.innerHTML = `
      ${dish.hinhAnh ? `<img src="${dish.hinhAnh}" alt="${dish.ten}" class="dish-img">` : ''}
      <div class="dish-info">
        <h3>${dish.ten}</h3>
        <p>${dish.gia.toLocaleString()} đ</p>
      </div>
      <div class="dish-buttons">
        <button class="add" onclick="addToCart('${dish.ten}', ${dish.gia})">Thêm</button>
        <button class="edit" onclick="openEditForm('${category}', ${idx})">Sửa</button>
        <button class="delete" onclick="openDeleteConfirm('${category}', ${idx})">Xóa</button>
      </div>
    `;
    listEl.appendChild(item);
  });
}*/


// ======== FORM THÊM / SỬA ========

function openAddForm(category) {
  document.getElementById('add-form').style.display = 'block';
  const categoryInput = document.getElementById('dish-category');
  switch (category) {
    case 'starter': categoryInput.value = 1; break;
    case 'main': categoryInput.value = 2; break;
    case 'dessert': categoryInput.value = 3; break;
    default: categoryInput.value = 0;
  }
}

function openEditForm(category, idx) {
  currentCategory = category;
  isEditing = true;
  const dish = menuData[category][idx];
  
  if (!dish) {
    alert('Món ăn không tồn tại!');
    return;
  }
  
  editDishId = dish.id;

  document.getElementById('dish-name').value = dish.ten || '';
  document.getElementById('dish-price').value = dish.gia || '';
  document.getElementById('dish-img').value = dish.hinhAnh || '';
  document.getElementById('dish-category').value = dish.theloai || '';

  document.getElementById('add-form').style.display = 'flex';
}


function closeAddForm() {
  document.getElementById('add-form').style.display = 'none';
  isEditing = false;
  editIndex = null;
}

async function submitDish() {
  const name = document.getElementById('dish-name').value.trim();
  const price = parseFloat(document.getElementById('dish-price').value);
  const img = document.getElementById('dish-img').value.trim();
  const category = parseInt(document.getElementById('dish-category').value, 10);

  if (!name || isNaN(price) || price <= 0 || isNaN(category)) {
    alert('Vui lòng nhập đầy đủ và hợp lệ tên, giá, thể loại món ăn.');
    return;
  }

  const dishData = {
    ten: name,
    gia: price,
    hinhAnh: img || null,
    theloai: category
  };

  try {
    const token = localStorage.getItem('token'); // hoặc nơi bạn lưu token
    if (!token) {
      alert('Bạn chưa đăng nhập hoặc phiên làm việc hết hạn. Vui lòng đăng nhập lại.');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };

    let response;

    if (isEditing && editDishId) {
      // Gọi API PUT để cập nhật món ăn
      response = await fetch(`http://localhost:3000/api/monan/${editDishId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dishData)
      });
    } else {
      // Gọi API POST tạo món ăn mới
      response = await fetch('http://localhost:3000/api/monan', {
        method: 'POST',
        headers,
        body: JSON.stringify(dishData)
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Lỗi từ backend:', errorData);
      throw new Error(errorData.message || 'Lỗi khi lưu món ăn');
    }

    const data = await response.json();
    alert(data.message || (isEditing ? 'Cập nhật món ăn thành công!' : 'Lưu món ăn thành công!'));

    closeAddForm();
    await loadMenuFromSQL();
    renderCategory(currentCategory);

    // Reset trạng thái
    isEditing = false;
    editDishId = null;

  } catch (error) {
    console.error(error);
    alert(error.message || 'Lỗi khi lưu món ăn');
  }
}


// ======== GIỎ HÀNG =========

let cart = [];

function addToCart(name, price) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
}

function updateCartUI() {
  const tbody = document.getElementById('cart-items');
  tbody.innerHTML = '';
  let total = 0;

  cart.forEach((item, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td><input type="number" min="1" value="${item.qty}" onchange="changeQuantity(${index}, this.value)"></td>
      <td>${(item.price * item.qty).toLocaleString()} đ</td>
      <td><button onclick="removeItem(${index})">Xóa</button></td>
    `;
    tbody.appendChild(row);
    total += item.price * item.qty;
  });

  document.getElementById('cart-total').innerText = `Tổng: ${total.toLocaleString()} đ`;
}

function changeQuantity(index, newQty) {
  const qty = parseInt(newQty, 10);
  cart[index].qty = qty > 0 ? qty : 1;
  updateCartUI();
}

function removeItem(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function confirmOrder() {
  const cartItems = getCartItems();

  if (cartItems.length === 0) {
    document.getElementById('empty-cart-modal').style.display = 'block';
    return;
  }

  document.getElementById('order-confirmation').style.display = 'block';

  setTimeout(() => {
    document.getElementById('order-confirmation').style.display = 'none';
    document.getElementById('order-confirmed-modal').style.display = 'block';

    saveOrderToHistory(cartItems);
    clearCart();
  }, 1500);
}

function clearCart() {
  cart = [];
  updateCartUI();
}

function closeModal() {
  document.getElementById('empty-cart-modal').style.display = 'none';
}

function closeOrderConfirmedModal() {
  document.getElementById('order-confirmed-modal').style.display = 'none';
}

function closeConfirm() {
  document.getElementById('confirm-delete').style.display = 'none';
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

async function saveOrderToHistory(cartItems) {
  const orderId = 'DH' + Date.now(); // vẫn dùng mã đơn này nếu muốn
  const orderDate = new Date().toLocaleString('vi-VN');
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const payment = 'Chưa thanh toán'; // có thể lấy từ form người dùng chọn
  const status = 'Đang xử lý';

  const foodList = cartItems.map(item =>
    `${item.name} x ${item.quantity} - ${item.price.toLocaleString()} đ`
  ).join('\n');

  try {
    const response = await fetch('http://127.0.0.1:3000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderCode: orderId,
        orderDate: new Date(), // Gửi dạng ISO
        total,
        payment,
        status,
        foodList,
        cartItems
      })
    });

    const result = await response.json();
    if (!result.success) {
      alert('Lưu đơn hàng thất bại. Vui lòng thử lại.');
    }
  } catch (err) {
    console.error('Lỗi gửi đơn hàng:', err);
    alert('Đã xảy ra lỗi khi gửi đơn hàng.');
  }
}


// ======== XỬ LÝ XÓA MÓN ĂN ========

let deleteTarget = { category: null, index: null };

function openDeleteConfirm(category, idx) {
  deleteTarget = { category, index: idx };
  document.getElementById('delete-confirm-modal').style.display = 'flex';
}

// ======== THÊM NGUYÊN LIỆU ========

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

// ======== LOAD DỮ LIỆU TỪ SQL ========

async function loadMenuFromSQL() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/monan');
    const dishes = await res.json();

    menuData.starter = [];
    menuData.main = [];
    menuData.dessert = [];

    dishes.forEach(dish => {
      switch (dish.theloai) {
        case 1: menuData.starter.push(dish); break;
        case 2: menuData.main.push(dish); break;
        case 3: menuData.dessert.push(dish); break;
        default: console.warn('Thể loại không hợp lệ:', dish);
      }
    });
  } catch (error) {
    console.error('Lỗi khi load menu từ SQL:', error);
  }
}
// xóa món 
async function xoaMon(idMonAn) {
  const response = await fetch('http://127.0.0.1:3000/api/monan/xoamon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idMonAn })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error('HTTP error: ' + response.status + ' - ' + errorText);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.message || 'Không rõ lỗi');
  }

  return data;
}


// ======== KHỞI ĐỘNG TRANG ========

window.addEventListener('DOMContentLoaded', async () => {
  await loadMenuFromSQL();
  showMenu('starter');

  const deleteConfirmModal = document.getElementById('delete-confirm-modal');
  deleteConfirmModal.style.display = 'none';

  document.getElementById('btn-delete-yes').addEventListener('click', async () => {
    const { category, index } = deleteTarget;
    const dish = menuData[category][index];
    if (!dish || !dish.id) {
      alert('Món ăn không tồn tại hoặc không có id');
      deleteConfirmModal.style.display = 'none';
      return;
    }

    try {
      await xoaMon(dish.id); // ✅ dùng lại hàm
      menuData[category].splice(index, 1);
      renderCategory(category);
      alert('Xóa món thành công!');
    } catch (error) {
      alert('Xóa món không thành công: ' + error.message);
    }

    deleteConfirmModal.style.display = 'none';
  });

  // Thêm sự kiện cho nút "Không xóa" để đóng modal
  document.getElementById('btn-delete-no').addEventListener('click', () => {
    deleteConfirmModal.style.display = 'none';
  });
});

window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.chuc_vu) {
    alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập.');
    window.location.href = "/login.html";
    return;
  }

  setupUIByRole(user.chuc_vu);
});

function setupUIByRole(chucVu) {
  const allButtons = ['btn-menu', 'btn-lichsu', 'btn-ykien', 'btn-xemykien', 'btn-kho', 'btn-tracuunv', 'btn-dknv', 'btn-tracukh', 'btn-hoadon', 'btn-lichlamviec','btn-logout'];

  allButtons.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const roleButtonsMap = {
    'Khách hàng': ['btn-menu', 'btn-lichsu', 'btn-ykien', 'btn-xemykien','btn-logout'],
    'Nhân viên phục vụ': ['btn-menu', 'btn-lichsu', 'btn-xemykien', 'btn-lichlamviec','btn-logout'],
    'Quản lí': ['btn-menu', 'btn-lichsu', 'btn-ykien', 'btn-xemykien', 'btn-kho', 'btn-tracuunv', 'btn-dknv', 'btn-tracukh', 'btn-hoadon', 'btn-lichlamviec','btn-logout'],
    'Nhân viên kho': ['btn-menu','btn-xemykien','btn-kho','btn-lichlamviec','btn-logout'],
    'Nhân viên bếp' :['btn-menu','bnt-lichsu','btn-xemykien','btn-lichlamviec','btn-logout'],
    'Nhân viên cskh' :['btn-menu','btn-lichsu','btn-xemykien','btn-tracukh','btn-lichlamviec','btn-logout'],
    'Nhân viên thu ngân' :['btn-menu','btn-lichsu','btn-xemykien','btn-hoadon','btn-lichlamviec','btn-logout']
  };

  const buttonsToShow = roleButtonsMap[chucVu] || [];

  buttonsToShow.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'inline-block';
  });
}

//logout
document.getElementById('btn-logout').addEventListener('click', async function () {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errData = await response.json();
      alert('Logout thất bại: ' + (errData.error || response.statusText));
    }
  } catch (error) {
    console.error('Lỗi khi gọi API logout:', error);
  } finally {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
});


window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.chuc_vu === 'Quản lí') {
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.style.display = 'inline-block';
    });
  } else {
    document.querySelectorAll('.add-btn').forEach(btn => {
      btn.style.display = 'none';
    });
  }
});















