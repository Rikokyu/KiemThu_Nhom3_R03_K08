# Hướng dẫn tích hợp artefact kiểm thử, lệnh chạy và README nhóm

> Phụ trách chính: Nguyễn Trung Hiệp  
> Thời gian theo bảng phân công: 10/11/2026–20/11/2026  
> Phối hợp: Nguyễn Văn An (môi trường), Ngô Văn Chương (ZAP/script), Đỗ Duy Bien (report/bằng chứng)

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
| Cấu hình ZAP đã làm sạch                   | `dast/config/`                                    | Ngô Văn Chương                    |
| Script/harness và cách chạy                | `dast/scripts/`, `docs/dast-runbook.md`           | Ngô Văn Chương                    |
| Kết quả phân tích phát hiện                | `docs/findings.md`                                | Đỗ Duy Bien                       |
| Report và bằng chứng đã làm sạch           | `reports/`, `evidence/`                           | Người chạy; Đỗ Duy Bien tổng hợp  |

## Thứ tự tích hợp

1. **Chốt phiên bản:** điền repository, release/tag, commit SHA và dependency đã kiểm chứng vào `docs/version-lock.md`. Dùng đúng SHA khi clone/checkout; không dùng nhánh di động làm định danh kết quả.
2. **Ghi setup:** Nguyễn Văn An hoàn thiện đúng một hướng dẫn được nhóm dùng (`setup-local.md` hoặc `setup-docker.md`), gồm prerequisite, cấu hình mẫu, lệnh khởi động/kiểm tra/dừng, seed và reset. Hướng dẫn còn lại ghi rõ không áp dụng nếu nhóm không hỗ trợ cách đó.
3. **Tích hợp test:** liên kết mỗi test case với module/URL trong scope, điều kiện chạy, tài khoản/role (chỉ tên/placeholder), expected result và evidence. Trạng thái ban đầu là `NOT RUN`.
4. **Tích hợp ZAP:** Nguyễn Văn Chương ghi target local, phiên bản ZAP/image, cấu hình context/auth đã làm sạch, lệnh chính xác, report đầu ra và giới hạn scan trong `docs/dast-runbook.md` cùng `dast/`.
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
- [ ] Chạy test/DAST chỉ trên instance local đã được phê duyệt; bắt đầu passive scan, review scope rồi mới active scan.
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

## Thông tin chưa thể điền

Tại thời điểm tạo bộ khung, repository chưa có mã nguồn Snipe-IT, file compose, cấu hình ZAP, script chạy hay dữ liệu phiên bản đã chốt. Vì vậy các lệnh cài/chạy cụ thể phải được Nguyễn Văn An và Ngô Văn Chương bổ sung sau khi thực thi và kiểm chứng; không chạy active scan khi chưa xác nhận target local và khả năng reset.
