function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

async function sendMessage() {
  const userMsg = document.getElementById("msg").value.trim();
  if (!userMsg) return;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `
  <div class="chat-message user">
    <div class="avatar emoji">👤</div>
    <div class="bubble">${userMsg}</div>
  </div>`;


  const botReply = await getBotResponse(userMsg);
  chatBox.innerHTML += `
  <div class="chat-message bot">
    <div class="avatar emoji">🤖</div>
    <div class="bubble">${botReply.replace(/\n/g, "<br>")}</div>
  </div>`;

  chatBox.scrollTop = chatBox.scrollHeight;

  document.getElementById("msg").value = "";
}

async function getBotResponse(input) {
  input = input.toLowerCase();

  if (input.includes("menu") || input.includes("thực đơn")) {
    try {
      const res = await fetch("http://localhost:3000/api/monan");
      const dishes = await res.json();
      if (!Array.isArray(dishes) || dishes.length === 0) return "Hiện tại chưa có món ăn nào.";

      const limitedList = dishes.slice(0, 5).map(d => `${d.ten} - ${d.gia.toLocaleString()} đ`).join("\n");
      return "📋 Một vài món ăn hiện có:\n" + limitedList + "\n(Xem thêm tại menu chính)";
    } catch {
      return "⚠️ Xin lỗi, không thể lấy thực đơn lúc này.";
    }
  }

  if (input.includes("giờ") || input.includes("mở cửa") || input.includes("hours")) {
    return "🕙 Chúng tôi mở cửa từ 10h sáng đến 10h tối mỗi ngày.";
  }

  if (input.includes("địa chỉ") || input.includes("location")) {
    return "📍 Địa chỉ của chúng tôi: 123 Main St, Trung tâm thành phố.";
  }

  if (input.includes("đặt bàn") || input.includes("reservation") || input.includes("book")) {
    return "📞 Bạn có thể đặt bàn bằng cách gọi 123-456-7890.";
  }

  if (input.includes("góp ý") || input.includes("feedback") || input.includes("phản hồi")) {
    return "✉️ Để gửi góp ý, vui lòng nhập:\n`Tên - Email - Nội dung - Đánh giá (1-5) ở ô ý kiến`";
  }

  if (input.startsWith("feedback:")) {
    const parts = input.slice(9).split("-").map(p => p.trim());
    if (parts.length !== 4) return "❗ Định dạng chưa đúng. Hãy nhập: `feedback: Tên - Email - Nội dung - Đánh giá (1-5)`";

    const [name, email, content, ratingStr] = parts;
    const rating = parseInt(ratingStr);

    if (!name || !email || !content || isNaN(rating) || rating < 1 || rating > 5) {
      return "⚠️ Thông tin chưa hợp lệ. Vui lòng thử lại.";
    }

    try {
      const res = await fetch("http://localhost:3000/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, content, rating })
      });

      const data = await res.json();
      return res.ok ? "✅ Cảm ơn bạn đã góp ý!" : `❌ Góp ý thất bại: ${data.message}`;
    } catch (err) {
      return "❌ Lỗi khi gửi góp ý. Vui lòng thử lại sau.";
    }
  }

const categoryKeywords = [
  { keyword: "món nướng", theloai: 1 },
  { keyword: "món lẩu", theloai: 2 },
  { keyword: "món rau", theloai: 3 },
];

for (const item of categoryKeywords) {
  if (input.includes(item.keyword)) {
    try {
      const res = await fetch("http://localhost:3000/api/monan");
      const dishes = await res.json();

      const filtered = dishes.filter(d => Number(d.theloai) === item.theloai);

      if (!filtered.length) return `😥 Không tìm thấy ${item.keyword} nào.`;

      const reply = filtered.slice(0, 5)
        .map(d => `${d.ten} - ${d.gia.toLocaleString()} đ`)
        .join("\n");

      return `🍽 Một số ${item.keyword}:\n${reply}`;
    } catch {
      return `⚠️ Lỗi khi lọc ${item.keyword}.`;
    }
  }
}



  return "🤖 Xin lỗi, tôi chưa hiểu. Bạn có thể hỏi về menu, giờ mở cửa, địa chỉ, hoặc gửi góp ý.";
}

function closeForm() {
  const form = document.getElementById("myForm");
  form.style.animation = "slideOut 0.3s ease forwards";
  setTimeout(() => {
    form.style.display = "none";
    form.style.animation = ""; // ✅ Reset animation so it can reopen
  }, 300);
}

document.getElementById("msg").addEventListener("keypress", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

