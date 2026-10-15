# Báo cáo và artefact kiểm thử

Lưu report đã làm sạch tại đây; ảnh và log minh chứng được sắp xếp riêng trong `../evidence/screenshots/` và `../evidence/logs/`. Mỗi lần chạy cần định danh run, ngày/giờ, người chạy, Snipe-IT SHA, phiên bản ZAP, target local, scope, test case liên quan và trạng thái xác minh. Hướng dẫn lệnh chuẩn nằm ở `../docs/dast-runbook.md`.

## Quy tắc lưu

- Giữ report cuối cùng cần thiết; không commit bản export thô nếu chưa rà soát.
- Che hoặc loại bỏ password, token, cookie/session, dữ liệu cá nhân và thông tin môi trường nhạy cảm.
- Dùng tên file nhất quán, ví dụ `RUN-<id>-<YYYYMMDD>-<report-type>.<ext>`.
- Liên kết bằng đường dẫn tương đối từ tài liệu liên quan; không dùng đường dẫn ổ đĩa cá nhân.
- Không ghi kết quả `PASS`/`FAIL` nếu chưa chạy và chưa có bằng chứng phù hợp.
