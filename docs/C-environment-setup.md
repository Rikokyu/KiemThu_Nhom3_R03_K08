# Môi trường triển khai — tham chiếu mục C

Tài liệu này giữ làm liên kết tham chiếu cho phần môi trường trong báo cáo;
không phải hướng dẫn cài đặt độc lập. Thông tin đã được đối chiếu trong
[version-lock.md](version-lock.md) và [test-environment.md](test-environment.md).

| Thành phần | Thông tin đã ghi nhận |
|---|---|
| Ứng dụng | Snipe-IT `v8.8.0` |
| Commit upstream | `2c466fa8a5a68525439bf1bbbc24470d6670c516` |
| Nền tảng | Windows 11, Docker Desktop/Linux Containers, WSL 2 |
| Cơ sở dữ liệu | MariaDB 11.4.7 |
| URL lab | `http://localhost:8000` |
| Tài khoản kiểm thử | Theo vai trò; credential chỉ lưu local, không ghi vào repository |
| Phiên bản OWASP ZAP | **CẦN XÁC NHẬN** |

Repository bài tập không chứa source Snipe-IT hoặc Compose file. Các bước
khởi chạy đã ghi nhận nằm tại [setup-docker.md](setup-docker.md). Cách cài
trực tiếp không qua Docker chưa được xác minh; xem [setup-local.md](setup-local.md).
