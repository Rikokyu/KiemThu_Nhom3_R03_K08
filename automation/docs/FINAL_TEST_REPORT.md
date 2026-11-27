# Báo cáo kiểm thử Playwright

## 1. Kết quả gần nhất được cung cấp

Người dùng cung cấp kết quả chạy `npm run test:full`. Metadata local của
summary/raw result khớp với RUN_ID `20261127142336-FDB59D`; summary được sinh
lúc `2026-11-27T14:26:40Z`:

| Chỉ số execution | Số lượng |
|---|---:|
| Tổng executions | 34 |
| PASS | 31 |
| FAIL | 1 |
| SKIPPED | 2 |
| Thời lượng | Khoảng 3 phút 12 giây |

Suite có 29 mã Test Case nghiệp vụ; 34 executions gồm các subtest của
`ASSET-04` và một smoke check. Ở cấp case ID: **26 PASS, 1 FAIL, 2 SKIPPED**.
Không tính smoke check là case nghiệp vụ. Raw Playwright JSON ghi hai lần
chạy là `SKIPPED`; generator hiển thị chúng là `BLOCKED` ở summary case-level.

| Nhóm | PASS | FAIL | SKIPPED | Tổng mã case |
|---|---:|---:|---:|---:|
| AUTH | 6 | 0 | 0 | 6 |
| AUTHZ | 5 | 0 | 1 | 6 |
| ASSET | 6 | 1 | 0 | 7 |
| API | 6 | 0 | 0 | 6 |
| COOKIE | 3 | 0 | 1 | 4 |
| **Tổng** | **26** | **1** | **2** | **29** |

Kết quả trên giữ nguyên assertion/test code. Không chạy lại test trong lần
chỉnh sửa tài liệu này.

## 2. FAIL và SKIPPED

### ASSET-04 — FAIL

- **Quan sát:** lượt chạy báo `warranty_months=241` được ứng dụng chấp nhận.
- **Assertion:** kỳ vọng HTTP 422 hoặc JSON `status: error`.
- **Kết luận:** kết quả thực tế không khớp assertion. Nguyên nhân và việc giá
  trị 241 có bị cấm theo yêu cầu nghiệp vụ hay không cần
  **CẦN XÁC NHẬN**. Không kết luận chắc chắn là lỗi ứng dụng và không thay
  assertion để làm đẹp kết quả.

### AUTHZ-06 — SKIPPED

FMCS/Company Scoping chưa bật trong môi trường ghi nhận; cần môi trường kiểm
thử được cấu hình sẵn và Company fixtures đã xác minh. Automation không tự
đổi cấu hình hệ thống.

### COOKIE-04 — SKIPPED

Target dùng HTTP; thuộc tính Secure chỉ có thể được xác minh trên HTTPS. Cần
HTTPS endpoint và chính sách cookie đã thống nhất.

## 3. Lịch sử các lượt trước có report

| Lượt | RUN_ID | PASS | FAIL | BLOCKED/SKIPPED | Ghi nhận |
|---|---|---:|---:|---:|---|
| Full run cũ 1 | `20261127141228-F92D1A` | 25 | 2 | 2 | API-03 lỗi tên token; ASSET-04 warranty 241. |
| Full run cũ 2 | `20261127141633-ACA2D0` | 26 | 1 | 2 | API-03 pass sau rút ngắn tên; ASSET-04 còn fail. |
| Lượt gần nhất; summary sinh `2026-11-27T14:26:40Z` | `20261127142336-FDB59D` | 26 | 1 | 2 SKIPPED raw / BLOCKED trong summary | 34 executions: 31 pass, 1 fail, 2 skipped. |

Hai lượt full run cũ đã ghi nhận cleanup và fingerprint inventory active
khớp baseline: 18 Models, 7 Status Labels, 20 Categories, 111 Companies,
21 Locations, 2,107 Users, 1 Group, 2,559 Assets. Database có 2,609 Assets
tổng, gồm 50 Archived không có trong active API listing.

Summary của lượt mới nhất xác nhận cleanup và fingerprint inventory active
khớp baseline. Các record run-owned có thể còn trong database do soft-delete;
token được revoke.

## 4. Đánh giá phạm vi và độ tin cậy

- 29 case IDs đều có phần triển khai; hai case hiện SKIPPED do precondition,
  không phải thiếu code.
- Test dùng fixture riêng và một worker. API mutation kiểm tra JSON business
  result/readback khi phù hợp; HTTP 200 một mình không được coi là PASS.
- Kết quả Playwright này không thay thế bộ DAST/thủ công có mã `TC_*`.
- Không có kết quả DAST mới được suy ra từ lượt Playwright này.
- 34 executions, 31 PASS, 1 FAIL, 2 SKIPPED khớp raw JSON và summary của
  RUN_ID trên; hai case chờ điều kiện được hiển thị `BLOCKED` trong summary.

## 5. Hướng dẫn chạy lại

1. Khởi chạy đúng Snipe-IT local đã được phép kiểm thử.
2. Tại PowerShell:

   ```powershell
   Set-Location automation
   npm ci
   Copy-Item .env.example .env
   ```

3. Điền `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` vào `.env` local.
4. Chạy `npm run test:list`, sau đó `npm run test:full`.
5. Xem output của run và các file sinh trong `automation/reports/` và
   `automation/test-results/`. Ghi lại Run ID/thời gian; xác nhận report khớp
   đúng lượt chạy trước khi cập nhật tài liệu.
6. Nếu cần tiếp tục cleanup, chạy `npm run test:data-cleanup` trong thư mục
   `automation/` và kiểm tra manifest/fingerprint.

Chi tiết từng case: [TEST_CASE_IMPLEMENTATION_REPORT.md](TEST_CASE_IMPLEMENTATION_REPORT.md).
Hướng dẫn môi trường/dữ liệu: [TEST_DATA_REQUIREMENTS.md](TEST_DATA_REQUIREMENTS.md)
và [TEST_DATA_MANAGEMENT.md](TEST_DATA_MANAGEMENT.md).
