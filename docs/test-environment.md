# Môi trường và tài khoản kiểm thử Snipe-IT

> Tài liệu này dành cho môi trường lab local của Nhóm 4. Không sử dụng các tài khoản này trên hệ thống Internet hoặc môi trường sản xuất.

## Thông tin môi trường

| Thành phần | Giá trị |
|---|---|
| Ứng dụng | Snipe-IT `v8.8.0` |
| URL | `http://localhost:8000` |
| Database service | MariaDB 11.4.7 |
| Cách dựng | Docker Compose trên Windows/WSL 2 |
| Repository upstream | `https://github.com/grokability/snipe-it` |
| Commit | `2c466fa8a5a68525439bf1bbbc24470d6670c516` |

## Tài khoản quản trị

| Vai trò | Username | Email | Password |
|---|---|---|---|
| Administrator/Super User | `admin` | `admin@local.test` | `Admin@12345` |

Admin phải đăng nhập thành công tại `/login`, vào Dashboard và được phép truy cập tạo người dùng, import dữ liệu và quản lý tài sản.

## Tài khoản End-User

| Vai trò | Username | Email | Password |
|---|---|---|---|
| End-User | `enduser` | `enduser@local.test` | `User@12345` |

End-User dùng để kiểm thử quyền tự xem tài sản của tài khoản và kiểm thử phân quyền.

## Kiểm tra phân quyền

1. Đăng nhập bằng `admin`.
2. Vào **People > Create User**, tạo hoặc xác nhận tài khoản `enduser`.
3. Đăng xuất.
4. Đăng nhập bằng `enduser`.
5. Mở `http://localhost:8000/account/view-assets`.
6. Mở trực tiếp `http://localhost:8000/users`.
7. Kết quả mong đợi: tài khoản End-User không truy cập trang quản trị `/users`; trả về HTTP 403 hoặc redirect phù hợp.

## Import dữ liệu mẫu

1. Đăng nhập bằng tài khoản Admin.
2. Vào menu **Import** tại `http://localhost:8000/import`.
3. Chọn loại dữ liệu muốn import.
4. Sử dụng các CSV có trong thư mục `sample_csvs` của nguồn Snipe-IT `v8.8.0`.
5. Ghi tên file, số dòng, kết quả và bằng chứng vào test case tương ứng.

Các tài khoản và dữ liệu trên không được nhập dữ liệu cá nhân thật.
