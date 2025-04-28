function showMenu(sectionId) {
  // Ẩn tất cả các phần
  const sections = document.querySelectorAll('.menu-section');
  sections.forEach(section => {
    section.style.display = 'none';
  });

  // Hiện phần được chọn
  const selectedSection = document.getElementById(sectionId);
  if (selectedSection) {
    selectedSection.style.display = 'block';
  }
}

// Khi trang vừa load, tự động hiện "Món khai vị"
window.addEventListener('DOMContentLoaded', () => {
  showMenu('starter');
});


