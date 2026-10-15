# Cấu hình DAST có thể chia sẻ

Lưu tại đây cấu hình ZAP/profile/context đã được rà soát và loại bỏ dữ liệu nhạy cảm. Mỗi cấu hình cần ghi target local, phiên bản ZAP, cách nạp và liên kết tới `docs/dast-runbook.md`.

Không commit password, API key, token, cookie/session, dữ liệu cá nhân, file export chưa làm sạch hoặc target ngoài scope. Dùng biến môi trường/secret store local theo hướng dẫn ZAP; không đặt giá trị secret trực tiếp trong file mẫu.
