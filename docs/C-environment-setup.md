# Ghi lại thông tin môi trường chạy file này

> File này dùng để lưu thông tin môi trường thực tế sau khi hệ thống đã chạy thành công. Không lưu mật khẩu, token, private key, cookie hoặc thông tin nhạy cảm trong repository.

| Thông tin            | Giá trị                                   |
| -------------------- | ----------------------------------------- |
| Phiên bản Snipe-IT   | Snipe-IT v8.8.0 build 25378 (g8d10063af9) |
| Địa chỉ local        | URL đang chạy, `http://localhost:8000`    |
| Phương pháp cài đặt  | Docker                                    |
| Hệ điều hành         | Windows                                   |
| Cơ sở dữ liệu        | mariadb                                   |
| Tài khoản thử nghiệm | Vai trò, không ghi mật khẩu               |
| Ngày thực hiện       | Ngày chạy kiểm thử                        |

> Không cần giữ mật khẩu hoặc token vào file này; chỉ ghi tên vai trò/định danh tài khoản dùng để test.

## Ghi chú lưu ý

- Chỉ điền sau khi môi trường đã chạy thành công và đã kiểm tra bằng chứng.
- Nếu repo dùng Docker, ghi rõ file compose hoặc lệnh thực tế đã chạy.
- Nếu repo dùng local setup, ghi rõ runtime, dependency và target URL đã xác nhận.
- Luôn giữ các file trong `docs/` sạch bí mật trước khi commit/push.
