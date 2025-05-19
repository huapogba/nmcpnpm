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

select * from NhanVien
select * from Taikhoan