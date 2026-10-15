# Runbook chạy DAST bằng OWASP ZAP

> Phụ trách: Ngô Văn Chương  
> Trạng thái: Bộ khung; lệnh phải được bổ sung sau khi chạy thử trên instance local.

## Điều kiện trước khi chạy

- Đọc `version-lock.md`; ghi phiên bản ZAP và Snipe-IT.
- Xác nhận ứng dụng đang chạy tại URL local đã ghi ở setup guide.
- Chuẩn bị dữ liệu giả lập, tài khoản test và cách reset.
- Kiểm tra target/context chỉ bao gồm instance local được nhóm cho phép.
- Chạy passive scan trước. Chỉ chạy active scan sau khi review scope và ảnh hưởng dữ liệu.

## Cấu hình

| Thuộc tính | Giá trị đã xác nhận |
|---|---|
| Target local | |
| ZAP version/image tag | |
| Context/profile | |
| Cấu hình auth (nếu có) | Đường dẫn file đã làm sạch |
| Thời gian chạy/người chạy | |

## Lệnh chạy

### Passive scan

```text
Chưa điền: dán lệnh chính xác đã chạy thành công, kèm shell/thư mục làm việc.
```

### Active scan

```text
Chưa điền: chỉ bổ sung sau khi scope local được review và có bước reset dữ liệu.
```

Không chạy các khối trên khi còn nội dung hướng dẫn/placeholder. Nếu dùng script trong `dast/scripts/`, ghi lệnh gọi script chính xác và tham số cần thiết; không đưa credential trực tiếp vào command line.

## Đầu ra và xử lý sau chạy

- Lưu report/log đã làm sạch dưới `reports/`; ghi tên file và thời gian chạy.
- Liên kết report với test case trong `docs/test-cases.md` và kết quả xác minh trong `docs/findings.md`.
- Ghi rõ cảnh báo chưa xác minh, false positive tiềm năng và giới hạn scan.
- Kiểm tra report không chứa cookie, token, mật khẩu, dữ liệu cá nhân hoặc host ngoài scope trước khi commit.

