# Hướng dẫn tích hợp artefact kiểm thử, lệnh chạy và README nhóm

> Phụ trách chính: Nguyễn Trung Hiệp  
> Thời gian theo bảng phân công: 10/11/2026–20/11/2026  
> Phối hợp: Nguyễn Văn An (môi trường), Nguyễn Lê Anh Tuấn (ZAP/script), Đỗ Duy Biên (report/bằng chứng)

## Mục tiêu

Thành viên khác có thể lấy đúng phiên bản Snipe-IT, chuẩn bị dependency, khởi động môi trường local, chạy lại test/DAST trong scope được phép và tìm được report/evidence tương ứng. Chỉ ghi lệnh đã chạy thành công trên môi trường được nêu rõ; không suy đoán phiên bản hoặc lệnh.

Repository hiện tại lưu README, tài liệu, cấu hình và artefact kiểm thử của nhóm. Không chép toàn bộ mã nguồn upstream Snipe-IT vào đây trừ khi nhóm thống nhất rõ cách quản lý riêng.

## Vị trí bàn giao

| Nội dung                                   | Vị trí                                            | Người cập nhật chính              |
| ------------------------------------------ | ------------------------------------------------- | --------------------------------- |
| README nhóm, lối vào và liên kết tài liệu  | `README.md`                                       | Nguyễn Trung Hiệp                 |
| Hướng dẫn tích hợp và checklist máy mới    | `docs/integration-guide.md`                       | Nguyễn Trung Hiệp                 |
| Hướng dẫn cài ứng dụng                     | `docs/setup-local.md` hoặc `docs/setup-docker.md` | Nguyễn Văn An                     |
| Tag/SHA và phiên bản dependency            | `docs/version-lock.md`                            | Nguyễn Trung Hiệp + Nguyễn Văn An |
| Test case, precondition và expected result | `docs/test-cases.md`, `test-cases/dast-test-cases.csv` | Nguyễn Trung Hiệp |
| Checklist trước/trong/sau scan | `test-cases/dast-checklist.md` | Nguyễn Trung Hiệp + Ngô Văn Chương |
| Cấu hình ZAP đã làm sạch                   | `dast/config/`                                    | Nguyễn Lê Anh Tuấn                |
| Script/harness và cách chạy                | `dast/scripts/`, `docs/dast-runbook.md`           | Nguyễn Lê Anh Tuấn                |
| Playwright, Test Data Management và báo cáo tự động | `automation/`                               | Ngô Văn Chương  |
| Kết quả phân tích phát hiện                | `docs/findings.md`                                | Đỗ Duy Biên                       |
| Report và bằng chứng đã làm sạch           | `reports/`, `evidence/`                           | Người chạy; Đỗ Duy Biên tổng hợp  |

## Thứ tự tích hợp

1. **Chốt phiên bản:** điền repository, release/tag, commit SHA và dependency đã kiểm chứng vào `docs/version-lock.md`. Dùng đúng SHA khi clone/checkout; không dùng nhánh di động làm định danh kết quả.
2. **Ghi setup:** môi trường đã ghi nhận dùng Docker Compose. Dùng `setup-docker.md`; `setup-local.md` được đánh dấu không hỗ trợ vì chưa có hướng dẫn local được kiểm chứng. Không chạy seed/reset trên dữ liệu cần giữ; `down -v` chỉ được cân nhắc cho lab dùng một lần, theo cảnh báo trong hướng dẫn.
3. **Tích hợp test:** liên kết mỗi test case với module/URL trong scope, điều kiện chạy, tài khoản/role (chỉ tên/placeholder), expected result và evidence. Trạng thái ban đầu là `NOT RUN`.
4. **Tích hợp ZAP:** Nguyễn Lê Anh Tuấn ghi target local, phiên bản ZAP/image, cấu hình context/auth đã làm sạch, thao tác chạy, report đầu ra và giới hạn scan trong `docs/dast-runbook.md` cùng `dast/`. Phiên bản ZAP và cấu hình profile/auth hiện chưa được xác minh (`CẦN XÁC NHẬN`); thư mục `dast/config/` và `dast/scripts/` hiện chỉ có README quy ước. Ngô Văn Chương phối hợp phân tích chức năng/URL.
5. **Tích hợp kết quả:** lưu report đã làm sạch dưới `reports/`, ảnh trong `evidence/screenshots/`, log đã rà soát trong `evidence/logs/`; cập nhật `docs/findings.md` và liên kết evidence bằng đường dẫn tương đối. Không đưa artefact thô chứa cookie, token, mật khẩu hoặc dữ liệu cá nhân vào Git.
6. **Hoàn thiện README:** README gốc dẫn tới setup, version lock, test case, runbook, findings và report. Phần Quick Start phải dùng đúng lệnh đã kiểm chứng ở các tài liệu nguồn, tránh duy trì nhiều bản lệnh khác nhau.
7. **Peer-review:** một thành viên không phải tác giả chạy lại theo checklist dưới đây, đối chiếu output/path report, kiểm tra scope và rà soát bí mật trước khi merge.

## Checklist chạy lại trên máy mới

- [ ] Clone repository nhóm và checkout nhánh/commit được chỉ định.
- [ ] Đọc `docs/version-lock.md`; xác nhận tag/SHA upstream và phiên bản dependency/tool.
- [ ] Làm theo duy nhất hướng dẫn setup được nhóm hỗ trợ; tạo cấu hình local từ mẫu an toàn, không commit file chứa secret.
- [ ] Khởi động ứng dụng và xác nhận URL/port local đúng với runbook.
- [ ] Tạo dữ liệu giả lập và tài khoản test theo hướng dẫn; xác nhận cách reset trước active scan.
- [ ] Hoàn thành checklist trong `test-cases/dast-checklist.md` và cập nhật trạng thái từng case trong CSV/Markdown.
- [ ] Chạy bộ phù hợp trên instance local đã được phê duyệt: test thủ công, Playwright (`automation/README.md`) và/hoặc DAST theo `docs/dast-runbook.md`. Không xem chúng là một bộ case.
- [ ] Với DAST, bắt đầu bằng thu thập/passive scan; chỉ chạy active scan sau khi review scope, có phê duyệt và có cách khôi phục.
- [ ] Xuất report/evidence vào vị trí được chỉ định; ghi ngày chạy, người chạy, phiên bản, target, trạng thái và giới hạn.
- [ ] Kiểm tra lại report/log/ảnh, loại bỏ thông tin nhạy cảm và cập nhật liên kết evidence.
- [ ] Ghi actual result; chỉ đánh dấu `PASS`/`FAIL` sau khi thực thi. Dùng `BLOCKED` hoặc `NOT RUN` đúng nghĩa.

## Quy cách ghi lệnh

Mỗi lệnh hướng dẫn phải có đủ:

- Hệ điều hành/shell đã chạy thử và thư mục làm việc.
- Dependency và phiên bản cần có trước khi chạy.
- Lệnh đầy đủ, kể cả file cấu hình/profile được dùng.
- Kết quả thành công mong đợi và bước kiểm tra lỗi.
- URL/target local, scope, đường dẫn report và cách reset nếu có tác động dữ liệu.
- Người kiểm chứng, ngày chạy, phiên bản ứng dụng/công cụ.

Đặt lệnh ứng dụng trong `docs/setup-*.md`; lệnh OWASP ZAP trong `docs/dast-runbook.md` và trỏ tới script/config tương ứng. Khi script là nguồn chạy chính, README gọi script thay vì chép lại một lệnh khác. Không để placeholder như `<PORT>` hoặc `<TAG>` trong phần được giới thiệu là lệnh chạy hoàn chỉnh.

## Review và bàn giao

- [ ] Cây thư mục trong README khớp các file thực có trong repository; tài liệu A–E và artefact theo cấu trúc đề xuất đã được ánh xạ rõ.
- [ ] Các đường dẫn liên kết mở được và không trỏ tới máy cá nhân.
- [ ] Một thành viên khác làm lại được các bước từ môi trường sạch.
- [ ] Kết quả kiểm tra và report khớp với test case; cảnh báo tự động chưa xác minh không được ghi thành defect đã xác nhận.
- [ ] `git diff --check` không báo lỗi whitespace; diff không có `.env`, credential, token, cookie, database dump hoặc report chưa làm sạch.
- [ ] PR nêu artefact/lệnh đã kiểm chứng, môi trường chạy và kết quả kiểm tra.

## Phân công test case theo tài liệu giữa kỳ

| Nhóm | Người phụ trách chính | Phối hợp | Trạng thái trong ảnh |
|---|---|---|---|
| Xác thực (`TC_AUTH_001`–`TC_AUTH_003`) | Nguyễn Trung Hiệp | — | Hoàn thành |
| Phân quyền (`TC_AUTHZ_001`–`TC_AUTHZ_002`) | Nguyễn Lê Anh Tuấn | Nguyễn Trung Hiệp | Hoàn thành |
| Quản lý tài sản (`TC_ASSET_001`–`TC_ASSET_002`) | Nguyễn Văn An | Ngô Văn Chương | Chưa ghi |
| API (`TC_API_001`–`TC_API_002`) | Đỗ Duy Biên | Nguyễn Văn An | Chưa ghi |
| Cookie (`TC_COOKIE_001`) | Nguyễn Trung Hiệp | — | Chưa ghi |
| ZAP (`TC_ZAP_001`–`TC_ZAP_002`) | Nguyễn Lê Anh Tuấn | — | Hoàn thành |
| Xác minh/phân loại lỗi | Ngô Văn Chương | Người phụ trách case tương ứng | Chưa ghi |

“Hoàn thành” ở bảng này là trạng thái nhóm công việc. Không tự chuyển trạng thái từng case sang `PASS` hoặc `FAIL`; phải điền actual result và evidence trong CSV sau khi đối chiếu kết quả chạy.

Playwright là bộ độc lập gồm 29 mã `AUTH-*`, `AUTHZ-*`, `ASSET-*`, `API-*`
và `COOKIE-*`. Theo thông tin nhóm cung cấp, Ngô Văn Chương phụ trách thiết kế,
triển khai, tích hợp và báo cáo bộ này; các artefact thực tế nằm trong
`automation/`. Không thay mã `TC_*` của bộ DAST bằng mã Playwright.

### Kết quả automation được cung cấp gần nhất

Lượt gần nhất có RUN_ID `20261127142336-FDB59D`, summary sinh lúc
`2026-11-27T14:26:40Z`: **34 executions, 31 PASS, 1 FAIL, 2 SKIPPED**,
thời lượng người chạy ghi nhận khoảng 3 phút 12 giây. 34 executions gồm 29
mã nghiệp vụ, các subtest của `ASSET-04` và một smoke check. Ở cấp mã case:
26 PASS, `ASSET-04` FAIL; `AUTHZ-06` và `COOKIE-04` bị chặn bởi precondition.
Playwright raw result gọi hai lần chạy đó `SKIPPED`; summary generator ánh xạ
sang `BLOCKED`. Summary/JSON local và cleanup/fingerprint evidence:
[`automation/docs/FINAL_TEST_REPORT.md`](../automation/docs/FINAL_TEST_REPORT.md).

Các hàng dưới đây là snapshot ảnh bảng tiến độ ban đầu, không phải báo cáo
trạng thái hiện tại; giữ lại để đối chiếu lịch sử và cần nhóm xác nhận trước
khi dùng như phân công/tiến độ mới nhất.

## Snapshot tiến độ công việc

Các trạng thái và ngày dưới đây được chép từ ảnh bảng tiến độ nhóm. Ngày giữ nguyên định dạng `DD/MM/YYYY`; ô trống trong bảng gốc được thể hiện là `—`.

| STT | Công việc | Phụ trách | Phối hợp | Trạng thái | Bắt đầu | Hoàn thành |
|---:|---|---|---|---|---|---|
| 1 | Xác nhận phiên bản, commit, Docker và trạng thái ứng dụng | Nguyễn Văn An | Ngô Văn Chương | Chưa bắt đầu | — | — |
| 2 | Chuẩn bị tài khoản theo vai trò và dữ liệu tài sản mẫu | Nguyễn Văn An | Nguyễn Trung Hiệp | Chưa bắt đầu | — | — |
| 3 | Rà soát kiến trúc, module, luồng nghiệp vụ và URL trong scope | Ngô Văn Chương | Nguyễn Lê Anh Tuấn | Hoàn thành | 11/08/2026 | 11/08/2026 |
| 4 | Rà soát test plan, tiêu chí PASS/FAIL và test case | Nguyễn Trung Hiệp | Đỗ Duy Biên | Hoàn thành | 18/10/2026 | 19/10/2026 |
| 5 | Cấu hình ZAP Context, scope và thu thập URL | Nguyễn Lê Anh Tuấn | Đỗ Duy Biên | Hoàn thành | 14/10/2026 | 19/10/2026 |
| 6 | Thực hiện test case xác thực và phân quyền | Nguyễn Trung Hiệp | Ngô Văn Chương | Hoàn thành | 07/11/2026 | 12/11/2026 |
| 7 | Thực hiện test case tài sản và API | Nguyễn Văn An | Nguyễn Trung Hiệp | Chưa bắt đầu | — | — |
| 8 | Thực hiện test case cookie và ZAP | Đỗ Duy Biên | Nguyễn Lê Anh Tuấn | Chưa bắt đầu | — | — |
| 9 | Xác minh cảnh báo, phân loại mức độ nghiêm trọng | Đỗ Duy Biên | Ngô Văn Chương; Nguyễn Lê Anh Tuấn | Chưa bắt đầu | — | — |
| 10 | Kiểm thử lại, kiểm thử hồi quy và tổng hợp báo cáo | Ngô Văn Chương | Nguyễn Trung Hiệp; cả nhóm | Chưa bắt đầu | — | — |

Ảnh tiến độ ghi các việc 1–2 chưa bắt đầu dù tài liệu phiên bản đã có thông tin khóa Snipe-IT. Cần đối chiếu bằng chứng Docker/runtime và cập nhật lại bảng theo dõi trước khi kết luận hai việc đã hoàn tất. Repository nhóm không chứa source Snipe-IT, file Compose, cấu hình ZAP hoặc script DAST; các lệnh và công cụ chưa được ghi nhận là đã chạy nếu chưa có evidence tương ứng.
