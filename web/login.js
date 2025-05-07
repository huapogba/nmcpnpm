document.addEventListener("DOMContentLoaded", function () {
    const registerBtn = document.getElementById("register-btn");
    const modal = document.getElementById("register-modal");
    const closeBtn = document.querySelector(".close-btn");
  
    registerBtn.onclick = function () {
      modal.style.display = "block";
    }
  
    closeBtn.onclick = function () {
      modal.style.display = "none";
    }
  
    window.onclick = function (event) {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('register-btn');
    const registerModal = document.getElementById('register-modal');
    const registerClose = registerModal.querySelector('.close-btn');
  
    const changePasswordBtn = document.querySelector('.login-change button:nth-child(2)');
    const changePasswordModal = document.getElementById('change-password-modal');
    const changeClose = changePasswordModal.querySelector('.change-close');
  
  
    // Mở modal Đổi mật khẩu
    changePasswordBtn.onclick = () => {
      changePasswordModal.style.display = 'block';
    };
    changeClose.onclick = () => {
      changePasswordModal.style.display = 'none';
    };
  
    // Đóng modal khi click bên ngoài
    window.onclick = function(event) {
      if (event.target === registerModal) {
        registerModal.style.display = 'none';
      }
      if (event.target === changePasswordModal) {
        changePasswordModal.style.display = 'none';
      }
    };
  });
  