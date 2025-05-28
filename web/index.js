const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql');
const jwt = require('jsonwebtoken')
const SECRET_KEY = 'chuoi_bi_mat_cua_ban';
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10; 

const app = express();

app.use(express.static(path.join(__dirname, 'html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html','login.html'));
});
app.use(cors());
app.use(bodyParser.json());

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

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();
//api tạo nhân viên
app.post('/api/nhanvien', verifyToken, authorizeRoles(['Quản lí']), async (req, res) => {
  const {
    ho_ten, ngay_sinh, cccd, dia_chi,
    sdt, email, chuc_vu, trang_thai
  } = req.body;

  if (!ho_ten || !ngay_sinh || !cccd || !sdt || !email || !chuc_vu) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ thông tin' });
  }
  // Kiểm tra sdt: phải đúng 10 chữ số
  if (!/^\d{10}$/.test(sdt)) {
  return res.status(400).json({ error: 'Số điện thoại phải có đúng 10 chữ số.' });
  }

  // Kiểm tra CCCD: phải đúng 12 chữ số
  if (!/^\d{12}$/.test(cccd)) {
  return res.status(400).json({ error: 'CCCD phải có đúng 12 chữ số.' });
  }

  // Kiểm tra email: phải đúng định dạng @gmail.com
  if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
  return res.status(400).json({ error: 'Email phải đúng định dạng @gmail.com.' });
  }

  try {
    await poolConnect;

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Kiểm tra trùng SDT
    const checkRequest = new sql.Request(transaction);
    checkRequest.input('sdt', sql.NVarChar(15), sdt);
    const checkResult = await checkRequest.query(`
      SELECT * FROM Taikhoan WHERE phone = @sdt
    `);
    if (checkResult.recordset.length > 0) {
      await transaction.rollback();
      return res.status(400).json({ error: 'Tài khoản đã tồn tại' });
    }

    // Mã hóa CCCD bằng bcrypt
    const encryptedCCCD = await bcrypt.hash(cccd, 10);

    // Thêm nhân viên
    const request = new sql.Request(transaction);
    request.input('ho_ten', sql.NVarChar(100), ho_ten);
    request.input('ngay_sinh', sql.Date, ngay_sinh);
    request.input('cccd', sql.NVarChar(255), encryptedCCCD); // Lưu bản mã hóa
    request.input('dia_chi', sql.NVarChar(255), dia_chi || null);
    request.input('sdt', sql.NVarChar(15), sdt);
    request.input('email', sql.NVarChar(100), email);
    request.input('chuc_vu', sql.NVarChar(50), chuc_vu);
    request.input('trang_thai', sql.NVarChar(50), trang_thai || 'Hoạt động');

    await request.query(`
      INSERT INTO NhanVien
      (ho_ten, ngay_sinh, cccd, dia_chi, sdt, email, chuc_vu, trang_thai)
      VALUES (@ho_ten, @ngay_sinh, @cccd, @dia_chi, @sdt, @email, @chuc_vu, @trang_thai)
    `);

    // Tạo tài khoản (mật khẩu = cccd cũng đã được hash)
    const accountRequest = new sql.Request(transaction);
    accountRequest.input('phone', sql.NVarChar(15), sdt);
    accountRequest.input('password', sql.NVarChar(255), encryptedCCCD); // Dùng lại bản hash CCCD
    accountRequest.input('chuc_vu', sql.NVarChar(50), chuc_vu);
    accountRequest.input('trang_thai', sql.NVarChar(50), trang_thai || 'Hoạt động');

    await accountRequest.query(`
      INSERT INTO Taikhoan (phone, Password, chuc_vu, trang_thai)
      VALUES (@phone, @password, @chuc_vu, @trang_thai)
    `);

    await transaction.commit();
    res.status(200).json({ message: 'Thêm nhân viên và tạo tài khoản thành công!' });

  } catch (err) {
    console.error('Lỗi thêm nhân viên:', err);
    res.status(500).json({ error: 'Lỗi server khi thêm nhân viên' });
  }
});
// api xem thông tin nhân viên 
app.get('/api/nhanvien/:sdt', async (req, res) => {
  const sdt = req.params.sdt;

  try {
    await poolConnect;
    const request = new sql.Request(pool);
    const result = await request
      .input('sdt', sql.NVarChar, sdt)
      .query('SELECT * FROM dbo.NhanVien WHERE sdt = @sdt');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Lỗi lấy nhân viên:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});


// api sửa thông tin nhân viên 
app.put('/api/nhanvien/:cccd', async (req, res) => {
  const cccd = req.params.cccd;
  const { ho_ten, ngay_sinh, dia_chi, sdt, email, chuc_vu, trang_thai } = req.body;

  if (!ho_ten || !ngay_sinh || !email || !chuc_vu) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin và đúng định dạng' });
  }

  const ngaySinhDate = new Date(ngay_sinh);
  if (isNaN(ngaySinhDate)) {
    return res.status(400).json({ message: 'Ngày sinh không hợp lệ.' });
  }

  let transaction;
  try {
    await poolConnect;
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Lấy số điện thoại cũ của nhân viên để so sánh
    const requestSelect = transaction.request();
    const oldPhoneResult = await requestSelect
      .input('cccd', sql.VarChar(12), cccd)
      .query('SELECT sdt FROM dbo.NhanVien WHERE cccd = @cccd');

    if (oldPhoneResult.recordset.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật.' });
    }

    const oldPhone = oldPhoneResult.recordset[0].sdt;

    // Cập nhật bảng NhanVien
    const requestUpdateNhanVien = transaction.request();
    const resultNhanVien = await requestUpdateNhanVien
      .input('ho_ten', sql.NVarChar(100), ho_ten)
      .input('ngay_sinh', sql.Date, ngaySinhDate)
      .input('cccd', sql.VarChar(12), cccd)
      .input('dia_chi', sql.NVarChar(200), dia_chi || '')
      .input('sdt', sql.VarChar(10), sdt || '')
      .input('email', sql.NVarChar(100), email)
      .input('chuc_vu', sql.NVarChar(50), chuc_vu)
      .input('trang_thai', sql.NVarChar(50), trang_thai || '')
      .query(`
        UPDATE dbo.NhanVien SET
          ho_ten = @ho_ten,
          ngay_sinh = @ngay_sinh,
          dia_chi = @dia_chi,
          sdt = @sdt,
          email = @email,
          chuc_vu = @chuc_vu,
          trang_thai = @trang_thai
        WHERE cccd = @cccd
      `);

    if (resultNhanVien.rowsAffected[0] === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Không tìm thấy nhân viên để cập nhật.' });
    }

    // Nếu số điện thoại thay đổi thì cập nhật bảng Taikhoan
    if (oldPhone !== sdt) {
      const requestUpdateTaiKhoan = transaction.request();
      await requestUpdateTaiKhoan
        .input('oldPhone', sql.VarChar(10), oldPhone)
        .input('newPhone', sql.VarChar(10), sdt || '')
        .query(`
          UPDATE dbo.Taikhoan SET
            phone = @newPhone,
            updatedAt = GETDATE()
          WHERE phone = @oldPhone
        `);
    }

    await transaction.commit();

    res.status(200).json({
      message: 'Cập nhật nhân viên thành công.',
      nhanvien: { ho_ten, ngay_sinh, dia_chi, sdt, email, chuc_vu, trang_thai, cccd }
    });

  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackErr) {
        console.error('Lỗi rollback khi cập nhật:', rollbackErr);
      }
    }
    console.error('Lỗi cập nhật nhân viên:', err);
    res.status(500).json({ message: 'Lỗi server khi cập nhật nhân viên' });
  }
});




// API đăng nhập
app.post('/api/login', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu' });
    }

    try {
        await sql.connect(config);

        const result = await sql.query`
            SELECT * FROM Taikhoan WHERE phone = ${phone} AND trang_thai = N'Hoạt động'
        `;
       
        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' });
        }
        

        const user = result.recordset[0];

        // So sánh mật khẩu đã hash
        /*if (password !== user.Password) {
          return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' });
            }*/

        const isMatch = await bcrypt.compare(password, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Số điện thoại hoặc mật khẩu không đúng' });
        }
        // Kiểm tra xem là nhân viên không
        const nvResult = await sql.query`
            SELECT tk.* FROM Taikhoan tk
            INNER JOIN NhanVien nv ON nv.sdt = tk.phone
            WHERE tk.phone = ${phone} 
            AND nv.trang_thai = N'Hoạt động'
            AND tk.trang_thai = N'Hoạt động'
        `;
        const nhanVien = nvResult.recordset[0] || null;

        // Lưu lịch sử đăng nhập
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        await sql.query`
            INSERT INTO LichSuDangNhap (tai_khoan_id, dia_chi_ip)
            VALUES (${user.id}, ${ip})
        `;

        // Tạo JWT
        const token = jwt.sign(
            {
                id: user.id,
                phone: user.phone,
                chuc_vu: user.chuc_vu
            },
            SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                chuc_vu: user.chuc_vu,
                nhanVien
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau' });
    } finally {
        sql.close();
    }
});

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ error: 'Không có token, từ chối truy cập' });
    }

    const token = authHeader.split(' ')[1]; // lấy phần token sau 'Bearer'

    if (!token) {
        return res.status(403).json({ error: 'Không có token, từ chối truy cập' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}
function authorizeRoles(allowedRoles) {
  return (req, res, next) => {
      const user = req.user;
      console.log('Role của user:', user?.chuc_vu); // debug
      if (!user || !allowedRoles.includes(user.chuc_vu)) {
          return res.status(403).json({ error: 'Bạn không có quyền truy cập chức năng này' });
      }
      next();
  };
}




//api đăng kí
app.post('/api/register', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu' });
    }

    try {
        await sql.connect(config);

        const checkResult = await sql.query`
            SELECT * FROM Taikhoan WHERE phone = ${phone}
        `;

        if (checkResult.recordset.length > 0) {
            return res.status(409).json({ error: 'Số điện thoại đã được đăng ký' });
        }

        // Hash mật khẩu
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Lưu mật khẩu đã hash vào database
        await sql.query`
            INSERT INTO Taikhoan (phone, Password, chuc_vu, trang_thai)
            VALUES (${phone}, ${hashedPassword}, N'Khách hàng', N'Hoạt động')
        `;
        await sql.query`
            INSERT INTO KhachHang (phone, Password, chuc_vu, trang_thai)
            VALUES (${phone}, ${hashedPassword}, N'Khách hàng', N'Hoạt động')
        `;

        res.json({ message: 'Đăng ký thành công' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau' });
    } finally {
        sql.close();
    }
});
// api đổi mật khẩu
app.post('/api/change-password', async (req, res) => {
    const { phone, oldPassword, newPassword } = req.body;

    if (!phone || !oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    try {
        await sql.connect(config);

        // 1. Tìm tài khoản với số điện thoại
        const result = await sql.query`
            SELECT * FROM Taikhoan WHERE phone = ${phone}
        `;

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Số điện thoại không tồn tại' });
        }

        const user = result.recordset[0];

        // 2. So sánh mật khẩu cũ đã hash
        const isMatch = await bcrypt.compare(oldPassword, user.Password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Mật khẩu cũ không đúng' });
        }

        // 3. Hash mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 4. Cập nhật mật khẩu mới
        await sql.query`
            UPDATE Taikhoan SET Password = ${hashedNewPassword}, updatedAt = GETDATE() WHERE phone = ${phone}
        `;

        res.json({ message: 'Đổi mật khẩu thành công' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi server, vui lòng thử lại sau' });
    } finally {
        sql.close();
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Không có token

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403); // Token sai hoặc hết hạn
        req.user = user; // lưu thông tin vào request để xử lý tiếp
        next();
    });
}
// api lấy thông tin nhân viên 
app.get('/api/nhanvien/data', authenticateToken, (req, res) => {
    if (req.user.chuc_vu !== 'Khách hàng') {
        return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    res.json({ message: 'Dữ liệu chỉ dành cho khách hàng' });
});

// API thêm nguyên liệu vào bảng KhoNguyenLieu
app.post('/api/kho', async (req, res) => {
  const { tenNguyenLieu, mucToiThieu, donVi, soLuongHienTai } = req.body;

  // Validate dữ liệu
  if (
    !tenNguyenLieu ||
    typeof tenNguyenLieu !== 'string' ||
    isNaN(Number(mucToiThieu)) ||
    !donVi ||
    typeof donVi !== 'string' ||
    isNaN(Number(soLuongHienTai))
  ) {
    return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
  }

  try {
    // Kết nối db
    const pool = await sql.connect(config);

    // Thực hiện insert
    await pool.request()
      .input('tenNguyenLieu', sql.NVarChar, tenNguyenLieu)
      .input('mucToiThieu', sql.Float, mucToiThieu)
      .input('donVi', sql.NVarChar, donVi)
      .input('soLuongHienTai', sql.Float, soLuongHienTai)
      .query(`
        INSERT INTO Kho (tenNguyenLieu, mucToiThieu, donVi, soLuongHienTai)
        VALUES (@tenNguyenLieu, @mucToiThieu, @donVi, @soLuongHienTai)
      `);

    res.status(200).json({ message: 'Đã lưu thành công' });
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu:', err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
});
// api cập nhật nguyên liệu 
app.put('/api/kho/update', async (req, res) => {
  const { tenNguyenLieu, soLuongHienTai } = req.body;

  if (!tenNguyenLieu || isNaN(soLuongHienTai)) {
    return res.status(400).json({ message: '❗ Dữ liệu cập nhật không hợp lệ!' });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('ten', sql.NVarChar, tenNguyenLieu)
      .input('sl', sql.Float, soLuongHienTai)
      .query('UPDATE Kho SET soLuongHienTai = @sl WHERE tenNguyenLieu = @ten');

    res.json({ message: 'Đã cập nhật số lượng!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi cập nhật số lượng!' });
  }
});


//api xóa nguyên liệu 
app.post('/api/kho/delete', async (req, res) => {
  const { tenNguyenLieu } = req.body;

  if (!tenNguyenLieu) {
    return res.status(400).json({ message: '❗ Thiếu tên nguyên liệu để xóa!' });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('ten', sql.NVarChar, tenNguyenLieu)
      .query('DELETE FROM Kho WHERE tenNguyenLieu = @ten');

    res.json({ message: 'Đã xóa nguyên liệu!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi xóa nguyên liệu!' });
  }
});


// api hiển thị nguyên liệu 
app.get('/api/kho', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Kho WHERE trangThai=1 ');
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu kho!' });
  }
});
// api thêm món ăn 
app.post('/api/monan', async (req, res) => {
  const { ten, gia, hinhAnh, theloai } = req.body;

  if (!ten || !gia || !theloai) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc: ten, gia hoặc theloai' });
  }

  try {
    await sql.connect(config);
    const request = new sql.Request();

    const imgValue = hinhAnh ? hinhAnh : null;

    await request.input('ten', sql.NVarChar(100), ten)
                 .input('gia', sql.Float, gia)
                 .input('hinhAnh', sql.NVarChar(sql.MAX), imgValue)
                 .input('theloai', sql.Int, theloai)
                 .query('INSERT INTO MonAn (ten, gia, hinhAnh, theloai, trangthai) VALUES (@ten, @gia, @hinhAnh, @theloai, 1)');

    res.json({ message: 'Thêm món ăn thành công!' });

  } catch (err) {
    console.error('Lỗi server khi thêm món ăn:', err);
    res.status(500).json({ message: 'Lỗi server khi thêm món ăn' });
  }
});
// api thêm nguyên liệu mới 
app.post('/api/kho', async (req, res) => {
  const { tenNguyenLieu, mucToiThieu, donVi, soLuongHienTai } = req.body;

  if (!tenNguyenLieu || !donVi || isNaN(mucToiThieu) || isNaN(soLuongHienTai)) {
    return res.status(400).json({ message: '❗ Dữ liệu không hợp lệ!' });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('ten', sql.NVarChar, tenNguyenLieu)
      .input('muc', sql.Float, mucToiThieu)
      .input('dv', sql.NVarChar, donVi)
      .input('sl', sql.Float, soLuongHienTai)
      .query(`
        IF EXISTS (SELECT 1 FROM Kho WHERE tenNguyenLieu = @ten)
          UPDATE Kho SET mucToiThieu = @muc, donVi = @dv, soLuongHienTai = @sl WHERE tenNguyenLieu = @ten
        ELSE
          INSERT INTO Kho (tenNguyenLieu, mucToiThieu, donVi, soLuongHienTai)
          VALUES (@ten, @muc, @dv, @sl)
      `);

    res.json({ message: '✅ Đã lưu nguyên liệu!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Lỗi khi lưu nguyên liệu!' });
  }
});

// hiển thị thực đơn
app.get('/api/monan', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM MonAn WHERE trangthai=1');
    res.json(result.recordset); // trả về mảng các món ăn
  } catch (err) {
    console.error('Lỗi khi truy vấn SQL:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});
// sửa món ăn 
app.put('/api/monan/:id',verifyToken, authorizeRoles(['Quản lí']), async (req, res) => {
  const dishId = req.params.id;
  const { ten, gia, hinhAnh, theloai } = req.body;

  if (!ten || !gia || !theloai) {
    return res.status(400).json({ message: 'Thiếu thông tin món ăn cần thiết' });
  }

  try {
    const pool = await sql.connect(config);

    const hinhAnhValue = (typeof hinhAnh === 'string' && hinhAnh.length > 0) ? hinhAnh : null;

    const result = await pool.request()
      .input('id', sql.Int, dishId)
      .input('ten', sql.NVarChar(100), ten)
      .input('gia', sql.Decimal(18, 2), gia)
      .input('hinhAnh', sql.NVarChar(sql.MAX), hinhAnhValue)
      .query(`
        UPDATE monan
        SET ten = @ten,
            gia = @gia,
            hinhAnh = @hinhAnh
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Món ăn không tồn tại' });
    }

    res.json({ message: 'Cập nhật món ăn thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi máy chủ khi cập nhật món ăn' });
  }
});

// xóa món ăn 
app.post('/api/monan/xoamon', async (req, res) => {
  const { idMonAn } = req.body;

  if (!idMonAn || isNaN(idMonAn)) {
    return res.status(400).json({ success: false, message: 'ID món ăn không hợp lệ' });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('id', sql.Int, idMonAn)
      .query('UPDATE MonAn SET trangthai = 0 WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn để xóa' });
    }

    res.json({ success: true, message: 'Xóa món thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa món:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// lưu đơn hàng 
app.post('/api/orders', verifyToken, async (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const customerId = req.user.id;
  console.log('CustomerId lấy từ token:', customerId);  // <-- In ra đây để debug

  const { orderCode, orderDate, total, payment, status, foodList } = req.body;

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO Orders 
        (OrderCode, OrderDate, Total, PaymentMethod, Status, FoodList, CustomerId)
      VALUES 
        (${orderCode}, ${orderDate}, ${total}, ${payment}, ${status}, ${foodList}, ${customerId})
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi lưu vào SQL:', err);
    res.status(500).json({ success: false });
  }
});



// đọc đơn hàng 
app.get('/api/orders', async (req, res) => {
  try {
    await sql.connect(config);

    let customerId = null;

    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, 'chuoi_bi_mat_cua_ban'); // Thay bằng secret thật
        customerId = decoded.id;
      } catch (err) {
        // Token không hợp lệ, customerId = null
      }
    }

    let query = 'SELECT * FROM Orders';
    if (customerId) {
      query += ' WHERE CustomerId = @customerId';
    }
    query += ' ORDER BY OrderDate DESC';

    const request = new sql.Request();
    if (customerId) {
      request.input('customerId', sql.Int, customerId);
    }

    const result = await request.query(query);

    res.json({ success: true, orders: result.recordset });
  } catch (err) {
    console.error('Lỗi lấy đơn hàng:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});


// cập nhật phương thức thanh toán 
app.put('/api/orders/:orderCode/payment', async (req, res) => {
  const { orderCode } = req.params;
  const { paymentMethod } = req.body;

  try {
    await sql.connect(config);
    await sql.query`
      UPDATE Orders
      SET PaymentMethod = ${paymentMethod}
      WHERE OrderCode = ${orderCode}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi cập nhật phương thức thanh toán:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});
// cập nhật trạng thái đơn hàng
app.put('/api/orders/:orderCode/status', async (req, res) => {
  const { orderCode } = req.params;
  const { status } = req.body;

  try {
    await sql.connect(config);
    await sql.query`
      UPDATE Orders
      SET Status = ${status}
      WHERE OrderCode = ${orderCode}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi cập nhật trạng thái:', err);
    res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
  }
});

// chọn chức vụ nhân viên để phân lịch làm 
app.get("/api/nhan-vien", async (req, res) => {
  const chucVu = req.query.chucVu;
  if (!chucVu) {
    return res.status(400).json({ error: "Thiếu chức vụ" });
  }

  try {
    const result = await pool.request()
      .input("chucVu", sql.NVarChar, chucVu)
      .query("SELECT ho_ten FROM NhanVien WHERE chuc_vu = @chucVu");

    const names = result.recordset.map(row => row.ho_ten);
    res.json(names);
  } catch (err) {
    console.error("Lỗi SQL:", err);
    res.status(500).json({ error: "Lỗi truy vấn dữ liệu nhân viên" });
  }
});
// phân công lịch làm việc 
app.post("/api/phancong", express.json(), async (req, res) => {
  const { nhan_vien_id, ngay, ca, chuc_vu } = req.body;

  if (!nhan_vien_id || !ngay || !ca) {
    return res.status(400).json({ error: "Thiếu thông tin" });
  }

  try {
    await pool.request()
      .input("nhan_vien_id", sql.Int, nhan_vien_id)
      .input("ngay", sql.Date, ngay)
      .input("ca", sql.NVarChar, ca)
      .input("chuc_vu", sql.NVarChar, chuc_vu)
      .query(`
        INSERT INTO LichLamViec (nhan_vien_id, ngay, ca, chuc_vu)
        VALUES (@nhan_vien_id, @ngay, @ca, @chuc_vu)
      `);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi lưu lịch:", err);
    res.status(500).json({ error: "Lỗi khi lưu lịch làm việc" });
  }
});
// lấy thông tin nhân viên 
app.get('/api/nhanvien-id', async (req, res) => {
  const name = req.query.name;
  if (!name) return res.status(400).json({ error: "Thiếu tên nhân viên" });

  try {
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .query('SELECT id FROM NhanVien WHERE ho_ten = @name');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy nhân viên" });
    }
    res.json({ id: result.recordset[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});
// api phân công ngày làm 
app.get('/api/phancong', async (req, res) => {
  const startDate = req.query.startDate;
  if (!startDate) {
    return res.status(400).json({ error: 'Thiếu tham số startDate' });
  }

  //console.log('startDate:', startDate);

  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    request.input('startDate', sql.Date, startDate);

    const result = await request.query(`
      SELECT 
        nv.ho_ten AS name,
        llv.chuc_vu,
         CONVERT(varchar, llv.ngay, 23) AS ngay,
        llv.ca
      FROM LichLamViec llv
      JOIN NhanVien nv ON llv.nhan_vien_id = nv.id
      WHERE llv.ngay BETWEEN @startDate AND DATEADD(DAY, 6, @startDate)
      AND llv.trangthai = 1
    `);

    //console.log('Dữ liệu phân công:', result.recordset);
    res.json(result.recordset);
  } catch (err) {
    console.error('Lỗi khi truy vấn phân công:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});
// api sửa xóa ngày làm nhân viên 
app.patch("/api/phancong", async (req, res) => {
  const { nhan_vien_id, ngay, ca, trangthai } = req.body;

  if (!nhan_vien_id || !ngay || !ca) {
    return res.status(400).json({ success: false, message: "Thiếu dữ liệu yêu cầu." });
  }

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input("nhan_vien_id", sql.Int, nhan_vien_id)
      .input("ngay", sql.Date, ngay)
      .input("ca", sql.NVarChar(20), ca)
      .input("trangthai", sql.Int, trangthai || 0) // ✅ fix ở đây
      .query(`
        UPDATE LichLamViec
        SET trangthai = @trangthai
        WHERE nhan_vien_id = @nhan_vien_id AND ngay = @ngay AND ca = @ca
      `);

    if (result.rowsAffected[0] > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Không tìm thấy phân công phù hợp." });
    }
  } catch (err) {
    console.error("Lỗi PATCH /api/phancong:", err); // bật debug lỗi
    res.status(500).json({ success: false, message: "Lỗi server." });
  }
});
// api lấy thông tin hóa đơn 
app.get('/api/orders1', async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT 
        OrderCode as id, 
        FORMAT(OrderDate, 'yyyy-MM-dd') as date, 
        Status as status, 
        FoodList as foodList, 
        Total as total,
        PaymentMethod
      FROM Orders
      ORDER BY OrderDate DESC
    `;
    res.json(result.recordset); // trả về mảng hóa đơn
  } catch (err) {
    console.error('SQL Error:', err);
    res.status(500).send('Lỗi server khi lấy dữ liệu');
  }
});
// api lưu ý kiến khách hàng 
app.post('/api/feedback', async (req, res) => {
  const { name, email, content, rating } = req.body;

  if (!name || !email || !content || rating == null) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc.' });
  }

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('content', sql.NVarChar, content)
      .input('rating', sql.Int, rating)      // Thêm input cho rating
      .query(`
        INSERT INTO CustomerFeedback (FullName, Email, Message, Rating)
        VALUES (@name, @email, @content, @rating)
      `);

    res.status(200).json({ message: 'Gửi ý kiến thành công.' });
  } catch (error) {
    console.error('Lỗi khi ghi vào CustomerFeedback:', error);
    res.status(500).json({ message: 'Lỗi server khi lưu ý kiến.' });
  }
});
// api lấy dữ liệu ý kiến khách hàng 
app.get('/api/feedback', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const emailFilter = req.query.email;
    let query = `SELECT FullName AS name, Email AS email, Message AS content, Rating AS rating, CONVERT(varchar, SubmittedAt, 23) AS date
                 FROM CustomerFeedback`;
    if (emailFilter) {
      query += ` WHERE Email = @Email`;
    }
    query += ` ORDER BY SubmittedAt DESC`;

    const request = pool.request();
    if (emailFilter) {
      request.input('Email', sql.NVarChar, emailFilter);
    }
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu feedback:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu feedback.' });
  }
});

// lấy dữ liệu khách hàng 
app.get("/api/users", async (req, res) => {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT phone, Password AS password, chuc_vu AS role 
      FROM Taikhoan 
      WHERE chuc_vu = N'Khách hàng' 
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});
// api đăng xuất 
const JWT_SECRET = 'chuoi_bi_mat_cua_ban';

app.post('/api/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Chưa đăng nhập' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token không hợp lệ' });

    // Giải mã token lấy phone
    const decoded = jwt.verify(token, JWT_SECRET);
    const phone = decoded.phone;
    if (!phone) return res.status(400).json({ error: 'Token không hợp lệ' });

    await sql.connect(config);

    // Lấy id tài khoản từ phone
    const result = await sql.query`
      SELECT id FROM Taikhoan WHERE phone = ${phone}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản' });
    }

    const tai_khoan_id = result.recordset[0].id;

    // Lấy IP client: nếu dùng proxy/nginx, header x-forwarded-for sẽ chứa IP thật
    // Nếu không có thì lấy ip từ connection
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || null;
    if (ip && ip.includes(',')) {
      // Nếu x-forwarded-for có nhiều IP, lấy IP đầu tiên
      ip = ip.split(',')[0].trim();
    }

    // Ghi lịch sử đăng xuất
    await sql.query`
      INSERT INTO LichSuDangXuat (tai_khoan_id, dia_chi_ip)
      VALUES (${tai_khoan_id}, ${ip})
    `;

    res.json({ message: 'Đăng xuất thành công, lịch sử đã được ghi nhận' });
  } catch (error) {
    console.error('Lỗi verify token hoặc ghi lịch sử:', error);
    res.status(500).json({ error: 'Lỗi server' });
  } finally {
    sql.close();
  }
});





const PORT = 3000;
app.listen(PORT, () => console.log(`Server chạy http://localhost:${PORT}`));
