# Phương pháp thiết kế Test Case Playwright

Tài liệu này áp dụng cho bộ chức năng Playwright với 29 mã `AUTH-*`,
`AUTHZ-*`, `ASSET-*`, `API-*` và `COOKIE-*`. Bộ này tách biệt với case DAST
`TC_*` trong `docs/test-cases.md`.

## Kỹ thuật kiểm thử

- **Equivalence Partitioning:** thông tin đăng nhập, API và dữ liệu Asset
  hợp lệ/không hợp lệ.
- **Boundary Value Analysis:** giới hạn input Asset, thời gian throttle và
  giá trị biên có liên quan.
- **Decision Table:** trạng thái tài khoản, quyền cá nhân/Group và quyền API.
- **Negative Testing:** truy cập chưa xác thực, ID sai và thiếu CSRF.
- **State Transition:** login/logout/session và vòng đời create/update/delete
  Asset.
- **Risk-based Testing:** truy cập xuyên Company cần FMCS.
- **Configuration Testing:** cookie/session và thuộc tính bảo mật.

## Trạng thái môi trường đã ghi nhận

- Target HTTP local không cho xác minh cờ Secure qua HTTPS.
- `AUTHZ-06` cần FMCS/Company Scoping; chưa thực hiện khi feature chưa bật.
- Lượt chạy gần nhất được người dùng cung cấp có 34 executions: 31 PASS,
  1 FAIL, 2 SKIPPED. `ASSET-04` là case fail; `AUTHZ-06` và `COOKIE-04`
  skipped do precondition. Run ID/report artifact cho lượt này
  **CẦN XÁC NHẬN**.
- `ASSET-04` ghi nhận ứng dụng chấp nhận `warranty_months=241` trong khi
  assertion mong từ chối. Đây là quan sát, chưa tự kết luận nguyên nhân hay
  yêu cầu nghiệp vụ.

Kết quả chi tiết và các case liên quan: [báo cáo triển khai](TEST_CASE_IMPLEMENTATION_REPORT.md)
và [báo cáo cuối](FINAL_TEST_REPORT.md).
