

window.onload = function() {
    // Lấy danh sách ý kiến từ localStorage
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
    
    const tableBody = document.querySelector('#feedback-list tbody');
    
    // Nếu không có ý kiến nào
    if (feedbacks.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5">Chưa có ý kiến nào.</td>'; // Cập nhật colspan = 5
        tableBody.appendChild(row);
        return;
    }

    // Duyệt qua tất cả các ý kiến và hiển thị chúng trong bảng
    feedbacks.forEach(feedback => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${feedback.name}</td>
            <td>${feedback.email}</td>
            <td>${feedback.content}</td>
            <td>${feedback.rating}</td>
            <td>${feedback.date || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
};


  