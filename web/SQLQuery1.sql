USE master;
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'QUANLYBANHANG')
BEGIN
    CREATE DATABASE QUANLYBANHANG;
END;
GO

USE QUANLYBANHANG;
GO


IF OBJECT_ID('dbo.NhanVien', 'U') IS NULL
BEGIN
    CREATE TABLE NhanVien (
        id INT IDENTITY(1,1) PRIMARY KEY,
        ho_ten NVARCHAR(100),
        ngay_sinh DATE NOT NULL,
        cccd NVARCHAR(20) UNIQUE NOT NULL,
        dia_chi NVARCHAR(255),
        sdt NVARCHAR(15),
        email NVARCHAR(100) UNIQUE NOT NULL,
        chuc_vu NVARCHAR(50),
        trang_thai NVARCHAR(50) DEFAULT N'Hoạt động',
        ngay_tao DATETIME DEFAULT GETDATE()
    );
END;
GO
IF OBJECT_ID('dbo.Taikhoan', 'U') IS NULL
BEGIN
      CREATE TABLE Taikhoan (
        id INT IDENTITY(1,1) PRIMARY KEY,
        phone NVARCHAR(15) NOT NULL UNIQUE,
        Password NVARCHAR(255) NOT NULL,
        chuc_vu NVARCHAR(50) NOT NULL, 
        trang_thai NVARCHAR(50) DEFAULT N'Hoạt động',
        createdAt DATETIME DEFAULT GETDATE(),
        updatedAt DATETIME DEFAULT GETDATE()
    );
END;
GO
IF OBJECT_ID('dbo.KhachHang', 'U') IS NULL
BEGIN
    CREATE TABLE KhachHang (
        id INT IDENTITY(1,1) PRIMARY KEY,
        phone NVARCHAR(15) NOT NULL UNIQUE,
		Password NVARCHAR(255) NOT NULL,
		chuc_vu NVARCHAR(30) NOT NULL,
		trang_thai NVARCHAR(30) DEFAULT N' Hoạt động',
        ngay_tao DATETIME DEFAULT GETDATE()
    );
END;
GO
IF OBJECT_ID('dbo.LichSuDangNhap', 'U') IS NULL
BEGIN
    CREATE TABLE LichSuDangNhap (
        id INT IDENTITY(1,1) PRIMARY KEY,
        tai_khoan_id INT NOT NULL,
        thoi_gian_dang_nhap DATETIME DEFAULT GETDATE(),
        dia_chi_ip NVARCHAR(50) NULL,
        FOREIGN KEY (tai_khoan_id) REFERENCES Taikhoan(id)
    );
END;
GO
IF OBJECT_ID('dbo.LichSuDangXuat', 'U') IS NULL
BEGIN
    CREATE TABLE LichSuDangXuat (
        id INT IDENTITY(1,1) PRIMARY KEY,
        tai_khoan_id INT NOT NULL,
        thoi_gian_dang_xuat DATETIME DEFAULT GETDATE(),
        dia_chi_ip NVARCHAR(50) NULL,
        FOREIGN KEY (tai_khoan_id) REFERENCES Taikhoan(id)
    );
END;
GO

IF OBJECT_ID('dbo.Kho', 'U') IS NULL
BEGIN
CREATE TABLE Kho (
    id INT PRIMARY KEY IDENTITY,
    tenNguyenLieu NVARCHAR(100) NOT NULL,
    mucToiThieu DECIMAL(10,2) NOT NULL, 
    donVi NVARCHAR(20) NOT NULL,        
    soLuongHienTai DECIMAL(10,2) NOT NULL DEFAULT 0, 
    ngayCapNhatCuoi DATETIME DEFAULT GETDATE(),      
    trangThai BIT DEFAULT 1,
	ngay_tao DATETIME DEFAULT GETDATE()
    );
END;
GO

IF OBJECT_ID('dbo.MonAn', 'U') IS NULL
BEGIN
    CREATE TABLE MonAn (
        id INT PRIMARY KEY IDENTITY,
        ten NVARCHAR(100) NOT NULL,
        gia FLOAT NOT NULL,
        hinhAnh NVARCHAR(MAX),
		theloai INT NOT NULL,
		trangthai INT NOT NULL,
		ngay_tao DATETIME DEFAULT GETDATE()
    );
END;
GO

IF OBJECT_ID('dbo.Orders', 'U') IS NULL
BEGIN
CREATE TABLE Orders (
    OrderID INT IDENTITY(1,1) PRIMARY KEY,               
    OrderCode NVARCHAR(50) NOT NULL,                    
    OrderDate DATETIME NOT NULL DEFAULT GETDATE(),       
    Total INT NOT NULL,                                  
    PaymentMethod NVARCHAR(50) NOT NULL DEFAULT N'Tiền mặt', 
    Status NVARCHAR(50) NOT NULL DEFAULT N'Đang xử lý',  
    FoodList NVARCHAR(MAX) NULL   
	);
END;
GO

IF OBJECT_ID('dbo.LichLamViec', 'U') IS NULL
BEGIN
CREATE TABLE LichLamViec (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nhan_vien_id INT NOT NULL,
    ngay DATE NOT NULL,
    ca NVARCHAR(10) CHECK (ca IN (N'Sáng', N'Chiều')),
    chuc_vu NVARCHAR(50),
    trangthai BIT DEFAULT 1,
    ngay_tao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (nhan_vien_id) REFERENCES NhanVien(id)
);
END;
GO

IF OBJECT_ID('dbo.CustomerFeedback', 'U') IS NULL
BEGIN
    CREATE TABLE CustomerFeedback (
        FeedbackID INT IDENTITY(1,1) PRIMARY KEY,
        FullName NVARCHAR(100) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
		Rating INT NULL, 
        SubmittedAt DATETIME NOT NULL DEFAULT GETDATE()
    );
END;
GO



select * from NhanVien
select * from KhachHang
select * from Taikhoan
select * from Kho
select * from MonAn
select * from Orders
select * from LichLamViec
select * from LichSuDangNhap
select * from LichSuDangXuat
select * from CustomerFeedback



