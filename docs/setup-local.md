# Cài đặt Snipe-IT trực tiếp trên máy (không hỗ trợ)

Repository hiện chỉ có hướng dẫn môi trường Docker Compose đã được ghi nhận.
Không có tài liệu thực nghiệm đủ căn cứ để đưa ra hướng dẫn cài Snipe-IT
không qua Docker; các phần cài runtime, database, dependency và migration
trước đây để trống nên không được xem là hướng dẫn sử dụng.

Để tái lập môi trường đã ghi nhận, dùng
[setup-docker.md](setup-docker.md) và đối chiếu
[version-lock.md](version-lock.md). Không tự suy ra phiên bản runtime hoặc
lệnh cài local từ tài liệu này.

Nếu nhóm muốn hỗ trợ cài trực tiếp trong tương lai, cần bổ sung và kiểm chứng
đủ các bước trên một máy sạch: phiên bản PHP/runtime, extension, database,
dependency, cấu hình `.env`, migration, lệnh khởi chạy, URL và bằng chứng
kiểm tra. Cho đến khi có các thông tin đó, cách chạy local không qua Docker
được đánh dấu **không hỗ trợ / CẦN XÁC NHẬN**.
