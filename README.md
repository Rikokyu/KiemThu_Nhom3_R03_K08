# Dự án kiểm thử Snipe-IT: R03 và K08

**Đơn vị:** Trường Đại học Đà Lạt – Khoa Công nghệ Thông tin

**Học phần:** Kiểm thử phần mềm

**Giảng viên:** Nguyễn Thế Lâm

**Nhóm trưởng:** Nguyễn Trung Hiệp

**Repository:** `Rikokyu/KiemThu_Nhom3_R03_K08`

## Giới thiệu

Dự án kiểm thử Snipe-IT (R03) kết hợp đánh giá bảo mật ứng dụng động K08
(DAST). Repository này lưu tài liệu, bộ test case, cấu hình/hướng dẫn công cụ,
bằng chứng và báo cáo của nhóm; mã nguồn Snipe-IT được lấy riêng từ upstream
theo phiên bản đã khóa.

## Mục tiêu và phạm vi

Nhóm đánh giá các luồng xác thực, phân quyền, quản lý tài sản, API, session/
cookie và HTTP security trên instance lab. Công việc gồm kiểm thử thủ công,
quét bảo mật DAST bằng OWASP ZAP và bộ kiểm thử chức năng tự động Playwright.
Hai bộ test có mã định danh, mục tiêu và báo cáo riêng; không gộp kết quả hoặc
thay mã case của nhau.

Chỉ kiểm thử trên instance local được phép. Không dùng dữ liệu thật, không
quét target Internet và không chia sẻ credential, cookie hoặc token.

## Công nghệ và phương pháp

- **Ứng dụng/lab:** Snipe-IT `v8.8.0`, commit
  `2c466fa8a5a68525439bf1bbbc24470d6670c516`; Docker Compose trên Windows/
  WSL 2; MariaDB 11.4.7. Tham khảo [khóa phiên bản](docs/version-lock.md).
- **DAST:** OWASP ZAP. Phiên bản ZAP thực tế chưa được xác minh trong tài liệu
  hiện có (`CẦN XÁC NHẬN`); xem [runbook](docs/dast-runbook.md).
- **Automation:** Playwright `1.65.1` theo lockfile; Node.js cần phiên bản
  tương thích với package (tham khảo `automation/package-lock.json`).
- **Phương pháp:** kiểm thử thủ công và negative testing; DAST passive scan,
  active scan chỉ khi được duyệt và có môi trường khôi phục; Playwright dùng
  Equivalence Partitioning, Boundary Value Analysis, Decision Table, State
  Transition, Risk-based và Configuration Testing.

## Thành viên và phân công

| Thành viên | Vai trò / công việc chính | Công việc thực hiện | Sản phẩm bàn giao |
|---|---|---|---|
| **Nguyễn Trung Hiệp** (nhóm trưởng) | Kế hoạch và điều phối kiểm thử | Lập kế hoạch; phụ trách `TC_AUTH_*`; rà soát/điều phối `TC_AUTHZ_*`; tổng hợp báo cáo | Kế hoạch, tiến độ, test case và báo cáo tổng hợp |
| **Nguyễn Lê Anh Tuấn** | DAST và OWASP ZAP | Thiết lập target/scope, thu thập URL, chạy ZAP; phụ trách `TC_ZAP_*` và `TC_AUTHZ_*` theo bảng phân công | Runbook/cấu hình đã làm sạch, report và evidence DAST |
| **Nguyễn Văn An** | Môi trường và dữ liệu Snipe-IT | Docker/DB, tài khoản và dữ liệu mẫu; phụ trách `TC_ASSET_*`, phối hợp `TC_API_*` | Hướng dẫn môi trường, dữ liệu kiểm thử và kết quả case được giao |
| **Ngô Văn Chương** | Phân tích hệ thống; xây dựng script test tự động | Phân tích kiến trúc/module/luồng/URL; Thiết kế test case cho kiểm thử tự động (có 29 test case thuộc `AUTH`, `AUTHZ`, `ASSET`, `API`, `COOKIE`); Triển khai và báo cáo lại kết quả Test tự động |  cấu hình Playwright, hướng dẫn và báo cáo lại kết quả kiểm thử tự động |
| **Đỗ Duy Biên** | Scenario, kiểm thử thủ công và findings | Thiết kế/rà soát scenario; phụ trách `TC_API_*`; đối chiếu kết quả, xác minh cảnh báo và phân loại findings theo bảng phân công | Scenario, actual result/evidence, findings và đề xuất xử lý |

Phân công gốc được giữ theo các tài liệu giữa kỳ trong repository; phần
Playwright của Ngô Văn Chương được bổ sung theo thông tin nhóm cung cấp và
artefact hiện có. Phân công không chứng minh riêng tác giả từng file/commit.
Các điểm cần nhóm xác nhận được nêu trong tài liệu tương ứng.

## Cấu trúc repository

```text
.
├── README.md
├── docs/                 # Phân tích, setup, test case, DAST, findings
├── test-cases/           # CSV DAST, CSV Playwright, checklist DAST
├── automation/
│   ├── config/ data/ fixtures/ helpers/ pages/ scripts/ tests/
│   └── docs/             # Thiết kế dữ liệu, case report, final report
├── dast/
│   ├── config/           # README quy ước; chưa có profile ZAP đã xác minh
│   └── scripts/          # README quy ước; chưa có script DAST đã xác minh
├── evidence/
│   ├── logs/
│   └── screenshots/
├── reports/              # Báo cáo DAST đã lưu và README quy tắc
└── presentation/         # README chuẩn bị demo
```

Thư mục `automation/reports/` và `automation/test-results/` được sinh khi chạy
Playwright, bị loại khỏi Git và có thể thay đổi theo từng lượt chạy.

## Cài đặt và chạy nhanh

### Snipe-IT lab

Môi trường đã ghi nhận là Docker Compose trên Windows/WSL 2. Repository nhóm
không chứa source Snipe-IT hoặc Compose file; cần lấy upstream theo tag/SHA và
làm theo [hướng dẫn Docker](docs/setup-docker.md). Hướng dẫn
[local](docs/setup-local.md) hiện không được hỗ trợ.

### Playwright

Từ PowerShell:

```powershell
Set-Location automation
npm ci
Copy-Item .env.example .env
```

Điền `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` vào `.env` local (đã
ignore). Sau đó chạy `npm run test:list` và `npm run test:full`. Global setup
xác thực Superuser trước khi chuẩn bị dữ liệu. Xem đầy đủ tại
[automation README](automation/README.md).

Không dùng `docker compose down -v` để xử lý lỗi thông thường. Lệnh này xóa
volume; chỉ xem xét cho lab dùng một lần, sau khi xác nhận dữ liệu có thể bị
xóa và sao lưu/khôi phục phù hợp. Chi tiết cảnh báo tại
[hướng dẫn Docker](docs/setup-docker.md).

## Các bộ Test Case và báo cáo

| Bộ kiểm thử | Mã case | Mục đích / cách thực hiện | Tài liệu và báo cáo |
|---|---|---|---|
| Thủ công/DAST theo thiết kế nhóm | `TC_AUTH_*`, `TC_AUTHZ_*`, `TC_ASSET_*`, `TC_API_*`, `TC_COOKIE_*`, `TC_ZAP_*` | Case CSV dùng để thiết kế và ghi nhận kiểm thử thủ công/DAST; trạng thái trong CSV không tự đổi theo kết quả Playwright | [Danh sách case](docs/test-cases.md), [CSV DAST](test-cases/dast-test-cases.csv), [runbook](docs/dast-runbook.md), [findings](docs/findings.md) |
| Tự động hóa chức năng Playwright | `AUTH-01`…`COOKIE-04` | 29 mã case, chạy qua fixture riêng và Test Data Manager; không phải bộ `TC_*` | [Implementation report](automation/docs/TEST_CASE_IMPLEMENTATION_REPORT.md), [Final report](automation/docs/FINAL_TEST_REPORT.md) |

### Kết quả gần nhất được cung cấp

Lượt chạy gần nhất có **RUN_ID `20261127142336-FDB59D`**; report sinh lúc
`2026-11-27T14:26:40Z`. Kết quả là **34 executions: 31 PASS, 1 FAIL,
2 SKIPPED**, thời lượng người chạy ghi nhận khoảng **3 phút 12 giây**. Đây
không phải 34 case nghiệp vụ riêng: 29 mã Playwright được cộng thêm các
subtest của `ASSET-04` và một smoke check. Ở cấp 29 mã case: **26 PASS,
1 FAIL, 2 case bị chặn bởi precondition**. Generator hiện ghi hai case đó
thành `BLOCKED` trong summary; Playwright raw result ghi chúng là `SKIPPED`.

- `ASSET-04`: ứng dụng nhận `warranty_months=241` trong khi assertion mong
  response từ chối (HTTP 422 hoặc JSON `status: error`). Đây là hiện tượng
  quan sát được; nguyên nhân và yêu cầu nghiệp vụ cần được xác nhận.
- `AUTHZ-06`: skipped vì FMCS/Company Scoping chưa được bật.
- `COOKIE-04`: skipped vì target hiện chỉ dùng HTTP, không thể xác minh cờ
  Secure qua HTTPS.

Summary và raw JSON của lượt này nằm trong các thư mục automation bị ignore;
không đưa output runtime vào Git. Cleanup và 8 inventory fingerprint được
summary xác nhận. Các lượt trước được ghi riêng trong
[Final Test Report](automation/docs/FINAL_TEST_REPORT.md).

## Tài liệu theo thứ tự đọc

1. [Khóa phiên bản](docs/version-lock.md) và [môi trường kiểm thử](docs/test-environment.md).
2. [Cài đặt Docker](docs/setup-docker.md), hoặc xem ghi chú
   [local setup không hỗ trợ](docs/setup-local.md).
3. [Phân tích hệ thống](docs/system-analysis.md) và
   [kiến trúc](docs/architecture.md).
4. [Test case thủ công/DAST](docs/test-cases.md),
   [checklist](test-cases/dast-checklist.md) và
   [DAST runbook](docs/dast-runbook.md).
5. [Findings](docs/findings.md) và [quy tắc lưu báo cáo](reports/README.md).
6. [Playwright hướng dẫn](automation/README.md),
   [quản lý dữ liệu](automation/docs/TEST_DATA_MANAGEMENT.md) và
   [báo cáo cuối](automation/docs/FINAL_TEST_REPORT.md).
7. [Tích hợp và bàn giao](docs/integration-guide.md),
   [quy tắc evidence log](evidence/logs/README.md) và
   [screenshot](evidence/screenshots/README.md).

## Mốc môn học

README ban đầu ghi mốc đăng ký đề tài `18/09` và báo cáo giữa kỳ `20/10`;
thời điểm bảo vệ cuối kỳ theo lịch nhà trường. Đây là các mốc trong hướng dẫn
môn học, không phải lịch trạng thái hiện tại. Cần xác nhận lịch chính thức nếu
dùng cho kế hoạch mới; snapshot tiến độ được lưu trong
[integration guide](docs/integration-guide.md).
