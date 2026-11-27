# Báo cáo triển khai Test Data Manager

> Đây là bằng chứng của lượt kiểm tra vòng đời Phase 1, không phải kết quả
> của lượt Playwright mới nhất được cung cấp sau đó.

- **RUN_ID:** `20261127132012-237D62`
- **Trạng thái vòng đời:** PASS theo report của lượt này
- **Target:** `http://localhost:8000`
- **Thời điểm report:** `2026-11-27T13:20:36.149Z`

## Bằng chứng vòng đời dữ liệu

| Kiểm tra | Kết quả | Bằng chứng đã ghi |
|---|---|---|
| Đăng nhập và xác minh Superuser | PASS | Account cấu hình, ID `1`, quyền Superuser được xác minh. |
| Đọc inventory và tìm fixture | PASS | Đã phân trang Models, Status Labels, Categories, Companies, Locations, Users, Groups, Assets; tìm động Model “Macbook Pro 13"” ID `1` và Status “Ready to Deploy” ID `1`. |
| Tạo User riêng và cấu hình quyền | PASS | User do run tạo, ID `2110`; kiểm tra activation, non-Superuser, quyền asset và API. |
| Đăng nhập User mới | PASS | Account ID `2110` đăng nhập thành công. |
| Tạo/kiểm chứng API token | PASS | Token xác thực đúng owner User ID `2110`; report không lưu token value. |
| Tạo Asset và đọc lại | PASS | Asset do run tạo, ID `2610`; API đọc lại đúng tag và Model/Status được chọn động. |
| Cleanup Asset | PASS | Asset thuộc run được soft-delete và xác minh. |
| Cleanup token | PASS | Token bị revoke, không còn trong danh sách owner và không còn xác thực. |
| Cleanup User | PASS | User do run tạo không còn trong API danh sách active. |
| Bảo toàn inventory ban đầu | PASS | Counts và fingerprint ID/identity khớp sau cleanup. |

## Baseline của lượt Phase 1

| Loại dữ liệu | Ban đầu | Sau cleanup |
|---|---:|---:|
| Models | 18 | 18 |
| Status Labels | 7 | 7 |
| Categories | 20 | 20 |
| Companies | 111 | 111 |
| Locations | 21 | 21 |
| Users | 2,107 | 2,107 |
| Groups | 1 | 1 |
| Assets active qua API | 2,559 | 2,559 |

Report này không chứa password, session cookie, CSRF token hoặc API token
value. Nó ghi nhận một lượt lifecycle cụ thể; không dùng để khẳng định trạng
thái cleanup của lượt chạy mới nhất chưa có manifest/report.
