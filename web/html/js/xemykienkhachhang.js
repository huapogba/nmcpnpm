window.onload = function () {
    const tableBody = document.querySelector('#feedback-list tbody');
    const inputEmail = document.getElementById('emailSearch');
    const btnSearch = document.getElementById('btnSearch');

    async function loadFeedbacks(email = '') {
      tableBody.innerHTML = ''; // Xóa dữ liệu cũ
      try {
        let url = 'http://localhost:3000/api/feedback';
        if (email) {
          url += '?email=' + encodeURIComponent(email);
        }

        const res = await fetch(url);
        if (!res.ok) throw new Error('Lỗi khi lấy dữ liệu feedback.');

        const feedbacks = await res.json();

        if (!Array.isArray(feedbacks) || feedbacks.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = '<td colspan="5">Chưa có ý kiến nào.</td>';
          tableBody.appendChild(row);
          return;
        }

        feedbacks.forEach(feedback => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${feedback.name}</td>
            <td>${feedback.email}</td>
            <td>${feedback.content}</td>
            <td>${feedback.rating ?? 'N/A'}</td>
            <td>${feedback.date || 'N/A'}</td>
          `;
          tableBody.appendChild(row);
        });
      } catch (error) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5">Lỗi tải dữ liệu: ${error.message}</td>`;
        tableBody.appendChild(row);
        console.error(error);
      }
    }

    // Gọi load feedback mặc định (không tìm kiếm)
    loadFeedbacks();

    // Bắt sự kiện nút tìm kiếm
    btnSearch.addEventListener('click', () => {
      const email = inputEmail.value.trim();
      loadFeedbacks(email);
    });
  };


  