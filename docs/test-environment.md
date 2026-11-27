# Môi trường và tài khoản kiểm thử Snipe-IT

> Tài liệu dành cho lab local của đề tài R03 + K08. Không sử dụng tài khoản hoặc dữ liệu lab trên hệ thống Internet hay môi trường production.

Tài liệu này mô tả lab cho kiểm thử thủ công/DAST. Playwright có cấu hình
credential riêng trong `automation/.env`; không mặc định tài khoản gợi ý bên
dưới là tài khoản của automation. Không ghi giá trị credential vào repository.

## Thông tin môi trường

| Thành phần | Giá trị |
|---|---|
| Ứng dụng | Snipe-IT `v8.8.0` |
| URL local | `http://localhost:8000` |
| Database service | MariaDB 11.4.7 |
| Cách dựng | Docker Compose trên Windows/WSL 2 |
| Repository upstream | `https://github.com/grokability/snipe-it` |
| Commit | `2c466fa8a5a68525439bf1bbbc24470d6670c516` |

Chi tiết phiên bản và cách khởi chạy được ghi tại [`version-lock.md`](version-lock.md) và [`setup-docker.md`](setup-docker.md).

## Vai trò/tài khoản kiểm thử

| Vai trò | Định danh local gợi ý | Quản lý thông tin xác thực |
|---|---|---|
| Administrator/Super User | `admin` | Tạo/đặt mật khẩu riêng trong môi trường local; không lưu mật khẩu trong repository |
| End-User | `enduser` | Tạo/đặt mật khẩu riêng trong môi trường local; không lưu mật khẩu trong repository |

Không ghi mật khẩu, token, cookie, private key hoặc nội dung `.env` vào tài liệu, CSV, log, ảnh chụp hay commit. Nếu credential thật từng được lưu trong Git, xóa khỏi file hiện tại không thu hồi các bản đã commit; cần đổi credential và xử lý lịch sử theo quy trình của repository.

## Kiểm tra phân quyền

1. Tạo hoặc xác nhận tài khoản Administrator và End-User trong instance local.
2. Đăng nhập bằng End-User.
3. Mở `http://localhost:8000/account/view-assets` để kiểm tra luồng tài sản cá nhân.
4. Thử mở trực tiếp `http://localhost:8000/users` theo test case đã duyệt.
5. Ghi response/actual result và evidence đã làm sạch vào case tương ứng.

Kết quả mong đợi là End-User không truy cập được trang quản trị nếu role không được cấp quyền; ghi nhận response thực tế (403, redirect hoặc hành vi phù hợp với cấu hình) thay vì giả định trước.

## Import dữ liệu mẫu

1. Đăng nhập bằng Administrator.
2. Mở `http://localhost:8000/import`.
3. Chọn loại dữ liệu muốn import.
4. Dùng CSV mẫu từ đúng release Snipe-IT `v8.8.0`.
5. Ghi tên file mẫu, số dòng, kết quả và evidence vào test case tương ứng.

Chỉ sử dụng dữ liệu giả lập. Trước khi thực hiện thao tác có thể thay đổi dữ liệu, xác nhận cách reset/khôi phục theo [`setup-docker.md`](setup-docker.md).
