# Khóa phiên bản và môi trường kiểm thử

> Cập nhật: Nguyễn Trung Hiệp + Nguyễn Văn An; ZAP do Ngô Văn Chương xác nhận.  
> Các giá trị dưới đây đã được kiểm chứng ngày 07/11/2026.

| Thành phần | Phiên bản/tag/SHA | Nguồn hoặc lệnh xác minh | Ngày xác minh | Người xác minh |
|---|---|---|---|---|
| Repository Snipe-IT | https://github.com/grokability/snipe-it | GitHub upstream | 07/11/2026 | Nguyễn Văn An |
| Release/tag | `v8.8.0` | `git describe --tags --always` | 07/11/2026 | Nguyễn Văn An |
| Commit SHA | `2c466fa8a5a68525439bf1bbbc24470d6670c516` | `git rev-parse HEAD` | 07/11/2026 | Nguyễn Trung Hiệp + Nguyễn Văn An |
| Hệ điều hành | Windows 11 + WSL 2 | Docker Desktop/Linux Containers | 07/11/2026 | Nguyễn Văn An |
| Runtime | PHP 8.3.6 trong image Snipe-IT | `php artisan about` | 07/11/2026 | Nguyễn Văn An |
| Database/service | MariaDB 11.4.7 | Docker Compose service `db` | 07/11/2026 | Nguyễn Văn An |
| Docker/Compose | Docker Engine 29.8.0 / Compose v5.5.1 | `docker version`, `docker compose version` | 07/11/2026 | Nguyễn Văn An |
| OWASP ZAP | Chưa cập nhật phiên bản thực tế | ZAP | Chưa xác minh | Ngô Văn Chương |
| Image ZAP (nếu dùng) | Chưa cập nhật | ZAP | Chưa xác minh | Ngô Văn Chương |

## Cấu hình kiểm thử

| Thuộc tính | Giá trị an toàn để chia sẻ |
|---|---|
| Cách dựng | Docker Compose |
| URL/port local | `http://localhost:8000` |
| Profile/context ZAP | |
| Lệnh chạy chuẩn | Liên kết [`dast-runbook.md`](./dast-runbook.md) |
| Vị trí report/evidence | `reports/` |

Không lưu mật khẩu, token, cookie, private key, nội dung `.env` hoặc dữ liệu cá nhân trong bảng này.
