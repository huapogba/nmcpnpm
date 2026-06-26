# Bug Restaurant - Website quản lý nhà hàng

Dự án là website quản lý nhà hàng được xây dựng bằng HTML, CSS, JavaScript và Node.js/Express. Backend kết nối SQL Server để xử lý đăng nhập, tài khoản, món ăn, giỏ hàng, đơn hàng, kho, nhân viên, lịch làm việc và ý kiến khách hàng.

## Demo

[ Xem video demo](https://drive.google.com/file/d/1A0y0zQonom2uyV2sAXRRI2wtJdQ1bUqO/view?usp=drive_link)

## Chức năng chính

- Đăng nhập, đăng ký tài khoản và đổi mật khẩu.
- Phân quyền theo chức vụ bằng JWT.
- Quản lý thực đơn: xem, thêm, sửa, xóa món ăn.
- Tạo giỏ hàng và xác nhận đơn hàng.
- Xem lịch sử đặt hàng, cập nhật thanh toán và trạng thái đơn.
- Quản lý kho nguyên liệu.
- Tra cứu và đăng ký nhân viên.
- Phân công lịch làm việc cho nhân viên.
- Gửi và xem ý kiến/đánh giá khách hàng.
- In hóa đơn.
- Chat popup hỗ trợ tra cứu món ăn và gửi feedback.

## Cấu trúc thư mục

```text
web/
+-- index.js                  # Server Express và các API
+-- html/                     # Giao diện client
|   +-- *.html                # Các trang giao diện
|   +-- css/                  # File style từng trang
|   +-- js/                   # Logic frontend từng trang
+-- sql/
    +-- SQLQuery1.sql         # Script tạo database và các bảng
```

## Công nghệ sử dụng

- Node.js
- Express
- SQL Server
- Thư viện Node.js: `body-parser`, `cors`, `mssql`, `jsonwebtoken`, `bcrypt`
- Frontend thuần: HTML, CSS, JavaScript

## Yêu cầu trước khi chạy

- Cài Node.js.
- Cài SQL Server và SQL Server Management Studio hoặc công cụ tương đương.
- Tạo database bằng file `sql/SQLQuery1.sql`.
- Cài các package Node.js cần thiết.

## Cài đặt

Nếu thư mục chưa có `package.json`, có thể khởi tạo và cài các thư viện:

```bash
npm init -y
npm install express body-parser cors mssql jsonwebtoken bcrypt
```

## Cấu hình database

Mở file `index.js` và chỉnh lại thông tin kết nối SQL Server cho đúng máy của bạn:

```js
const config = {
  user: "sa",
  password: "MatKhauMoi!",
  server: "LAPTOP-9K0RRUKB",
  database: "QUANLYBANHANG",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};
```

Database mặc định trong project là `QUANLYBANHANG`. File `sql/SQLQuery1.sql` sẽ tạo các bảng chính:

- `NhanVien`
- `Taikhoan`
- `KhachHang`
- `LichSuDangNhap`
- `LichSuDangXuat`
- `Kho`
- `MonAn`
- `Orders`
- `LichLamViec`
- `CustomerFeedback`

## Chạy project

Chạy server:

```bash
node index.js
```

Sau đó mở trình duyệt:

```text
http://localhost:3000
```

Trang mặc định là `html/login.html`. Các file frontend đang gọi API ở `localhost:3000` hoặc `127.0.0.1:3000`.

## Các trang giao diện

- `login.html`: đăng nhập, đăng ký, đổi mật khẩu.
- `menu.html`: thực đơn, giỏ hàng, tạo đơn hàng, chat popup.
- `lichsudathang.html`: lịch sử đơn hàng và cập nhật thanh toán/trạng thái.
- `quanlikho.html`: quản lý kho.
- `tracuunhanvien.html`: tra cứu và cập nhật nhân viên.
- `dienthongtinnhanvien.html`: đăng ký nhân viên.
- `tracuukhachhang.html`: tra cứu khách hàng.
- `lichlamviec.html`: phân công và xem lịch làm việc.
- `ykienkhachhang.html`: gửi feedback.
- `xemykienkhachhang.html`: xem feedback.
- `hoadon.html`: in hóa đơn.
- `chat.html`: giao diện chat riêng.

## API chính

### Tài khoản

- `POST /api/login`: đăng nhập.
- `POST /api/register`: đăng ký tài khoản khách hàng.
- `POST /api/change-password`: đổi mật khẩu.
- `POST /api/logout`: đăng xuất và ghi lịch sử đăng xuất.

### Nhân viên

- `POST /api/nhanvien`: thêm nhân viên và tạo tài khoản.
- `GET /api/nhanvien/:sdt`: lấy thông tin nhân viên theo số điện thoại.
- `PUT /api/nhanvien/:sdt`: cập nhật thông tin nhân viên.
- `GET /api/nhan-vien`: lấy danh sách nhân viên theo chức vụ.
- `GET /api/nhanvien-id`: lấy id nhân viên theo tên.

### Kho

- `GET /api/kho`: lấy danh sách kho.
- `POST /api/kho`: thêm nguyên liệu.
- `PUT /api/kho/update`: cập nhật nguyên liệu.
- `POST /api/kho/delete`: xóa/ẩn nguyên liệu.

### Món ăn và đơn hàng

- `GET /api/monan`: lấy danh sách món ăn.
- `POST /api/monan`: thêm món ăn.
- `PUT /api/monan/:id`: cập nhật món ăn.
- `POST /api/monan/xoamon`: xóa/ẩn món ăn.
- `POST /api/orders`: tạo đơn hàng.
- `GET /api/orders`: lấy lịch sử đơn hàng.
- `GET /api/orders1`: lấy đơn hàng cho trang hóa đơn.
- `PUT /api/orders/:orderCode/payment`: cập nhật phương thức thanh toán.
- `PUT /api/orders/:orderCode/status`: cập nhật trạng thái đơn hàng.

### Lịch làm việc và feedback

- `POST /api/phancong`: lưu phân công lịch làm việc.
- `GET /api/phancong`: lấy lịch làm việc.
- `POST /api/feedback`: gửi ý kiến khách hàng.
- `GET /api/feedback`: xem ý kiến khách hàng.
- `GET /api/users`: lấy danh sách khách hàng.

## Lưu ý

- Secret JWT và thông tin SQL Server hiện đang viết trực tiếp trong `index.js`. Khi đưa lên môi trường thật, nên chuyển sang biến môi trường `.env`.
- Frontend và backend đang có nhiều URL API hard-code đến `localhost:3000`/`127.0.0.1:3000`.
- Repo hiện chưa có script `npm start`; nếu muốn có thể thêm vào `package.json`:

```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```
