# Tự động hóa kiểm thử Snipe-IT bằng Playwright

## Yêu cầu và cài đặt

Môi trường kiểm thử Snipe-IT phải đang chạy tại URL local được phép. Package
lock ghi Playwright `1.65.1` và yêu cầu Node.js `>=20`.

Từ PowerShell tại thư mục repository:

```powershell
Set-Location automation
npm ci
Copy-Item .env.example .env
```

Điền `BASE_URL`, `ADMIN_USERNAME` và `ADMIN_PASSWORD` vào `automation/.env`.
File `.env` đã được Git ignore; không chia sẻ hoặc ghi các giá trị này vào log,
report hay source code. Global setup đăng nhập và xác minh quyền Superuser
trước khi chuẩn bị dữ liệu. Nếu preflight thất bại, suite dừng.

Để thuận tiện cho việc chạy test tự động, cần đáp ứng các yêu cầu sau:
Đã chạy dự án snipe-it và docker engine lên.
Sau khi chạy nên thì nạp dữ liệu mẫu của dự án vào.
Thì cuối cùng file `automation/.env` mặt định như sau:

```powershell
BASE_URL=http://localhost:8000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
```

## Lệnh chạy

```powershell
npm run test:list
npm run test:auth
npm run test:authz
npm run test:asset
npm run test:api
npm run test:cookie
npm run test:full
npm run test:report
```

Chạy một mã case:

```powershell
npm run test:case -- "AUTH-01"
```

Hoàn tất cleanup từ manifest hiện hành:

```powershell
npm run test:data-cleanup
```

## Nhóm kiểm thử

Suite có 29 mã nghiệp vụ thuộc AUTH (Authentication), AUTHZ (Authorization),
ASSET, API Testing và COOKIE (Cookie/Session). Đây là bộ riêng với mã DAST
`TC_*` trong `../docs/test-cases.md`. Các test dùng Playwright và helper để
kiểm tra giao diện, HTTP/API result và trạng thái dữ liệu tùy từng case.

## Quản lý dữ liệu

Mỗi lượt chạy có `RUN_ID`; fixture ghi nhận tài khoản, group, token và Asset
được tạo trong manifest. Asset Tag/tên nhận diện theo lượt chạy. Cleanup chỉ
thực hiện khi xác minh được RUN_ID, ID và identity; user/Asset có thể bị
soft-delete theo hành vi Snipe-IT, token bị revoke. Dữ liệu nền không phải
fixture xóa. Không chạy seeder/reset database. Xem
[quản lý test data](docs/TEST_DATA_MANAGEMENT.md) và
[yêu cầu dữ liệu](docs/TEST_DATA_REQUIREMENTS.md).

## Kết quả gần nhất được cung cấp

Lượt mới nhất: **RUN_ID `20261127142336-FDB59D`**, 34 executions,
**31 PASS, 1 FAIL, 2 SKIPPED**, khoảng 3 phút 12 giây. Vì `ASSET-04` có nhiều
subtest và suite có smoke check, ở cấp 29 mã nghiệp vụ là 26 PASS, 1 FAIL,
2 case bị chặn bởi precondition. Raw Playwright result ghi `SKIPPED`; summary
generator hiện ánh xạ hai case này thành `BLOCKED`.

- `ASSET-04`: input `warranty_months=241` được chấp nhận; assertion chờ HTTP
  422 hoặc JSON `status: error`. Hiện tượng đã quan sát được; nguyên nhân và
  yêu cầu nghiệp vụ cần xác nhận.
- `AUTHZ-06`: SKIPPED do FMCS/Company Scoping chưa được bật.
- `COOKIE-04`: SKIPPED do target HTTP, không thể xác minh cờ Secure qua HTTPS.
- Summary sinh lúc `2026-11-27T14:26:40Z` và raw JSON cùng khớp RUN_ID này;
  cleanup và 8 inventory fingerprint được xác nhận trong summary. Hai output
  nằm trong thư mục bị ignore, không được commit.

## Báo cáo

- [Báo cáo cuối](docs/FINAL_TEST_REPORT.md)
- [Bảng triển khai 29 case](docs/TEST_CASE_IMPLEMENTATION_REPORT.md)
- [Thiết kế chu kỳ](docs/TEST_CYCLE_DESIGN.md)
- [Báo cáo triển khai Test Data Manager](docs/TEST_DATA_IMPLEMENTATION_REPORT.md)

Report HTML/JSON và CSV được sinh trong `reports/` và `test-results/`; các
thư mục này bị ignore. Chỉ chia sẻ report sau khi kiểm tra thời điểm chạy,
Run ID và đảm bảo không có credential, token, cookie hoặc dữ liệu cá nhân.
