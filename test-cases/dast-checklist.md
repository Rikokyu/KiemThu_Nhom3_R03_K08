# Checklist thực thi DAST

Checklist này dùng cùng `dast-test-cases.csv` và `docs/dast-runbook.md`. Chỉ chạy trên instance local mà nhóm được phép kiểm thử. Active scan có thể làm thay đổi dữ liệu; phải xác nhận scope và khả năng reset trước khi chạy.

## Trước khi chạy

- [ ] Đọc `docs/version-lock.md`; ghi nhận Snipe-IT SHA và phiên bản OWASP ZAP.
- [ ] Xác nhận ứng dụng đang chạy tại URL local trong scope; không dùng target Internet/bên thứ ba.
- [ ] Xác nhận context/include/exclude và cấu hình xác thực; không để credential trong file chia sẻ hoặc command line.
- [ ] Chuẩn bị dữ liệu giả lập, tài khoản test và cách reset/khôi phục.
- [ ] Ghi run ID, người chạy, thời gian bắt đầu, target và mục tiêu scan.
- [ ] Chọn test case áp dụng; xác nhận precondition và expected result trước khi thực thi.

## Trong khi chạy

- [ ] Chạy passive scan trước và kiểm tra target/scope thực tế.
- [ ] Review kết quả và xác nhận có thể reset dữ liệu trước active scan.
- [ ] Chỉ chạy active scan trên target local được duyệt; dừng nếu phát hiện request ra ngoài scope.
- [ ] Ghi lệnh/profile, thời gian, lỗi, thay đổi dữ liệu và test case liên quan.
- [ ] Không đánh dấu `PASS`/`FAIL` chỉ dựa trên alert scanner.

## Sau khi chạy

- [ ] Lưu report đã rà soát trong `reports/`.
- [ ] Lưu screenshot đã làm sạch trong `evidence/screenshots/`; log đã rà soát trong `evidence/logs/`.
- [ ] Loại bỏ/che password, token, cookie/session, dữ liệu cá nhân và thông tin ngoài scope.
- [ ] Cập nhật actual result, trạng thái, người chạy, ngày chạy và đường dẫn evidence trong CSV/Markdown.
- [ ] Tái hiện/đối chiếu từng alert trước khi phân loại là defect; ghi rõ alert chưa xác minh/false positive.
- [ ] Reset hoặc khôi phục dữ liệu nếu cần; xác nhận ứng dụng sau kiểm thử.
- [ ] Kiểm tra `git diff` và nội dung artefact trước khi commit/push.

## Trạng thái hợp lệ

- `PASS`: expected result được đáp ứng và có bằng chứng.
- `FAIL`: expected result không được đáp ứng; đã tái hiện và có bằng chứng.
- `BLOCKED`: không thể thực thi; nêu rõ nguyên nhân.
- `NOT RUN`: chưa chạy, không được tính là pass.
