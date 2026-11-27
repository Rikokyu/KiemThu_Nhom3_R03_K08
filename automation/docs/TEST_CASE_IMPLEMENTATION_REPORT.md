# Báo cáo triển khai Test Case Playwright

## Tóm tắt lượt chạy mới nhất được cung cấp

- **Mã case nghiệp vụ:** 29.
- **RUN_ID:** `20261127142336-FDB59D`.
- **Summary sinh lúc:** `2026-11-27T14:26:40Z`.
- **Executions:** 34 = **31 PASS, 1 FAIL, 2 SKIPPED**.
- **Thời lượng:** khoảng 3 phút 12 giây.
- Do `ASSET-04` có nhiều subtest và suite có smoke check, số executions không
  đồng nghĩa với số case nghiệp vụ.

Ở cấp 29 mã case, kết quả tương ứng là **26 PASS, 1 FAIL, 2 SKIPPED**.
`AUTHZ-06` và `COOKIE-04` được skip vì thiếu điều kiện môi trường. Không quy
đổi thành PASS. Summary generator hiển thị hai case này là `BLOCKED`, còn raw
Playwright JSON ghi executions là `skipped`.

## Danh sách 29 case

| ID | Kết quả | File test | Tài khoản/dữ liệu và kết quả đã ghi nhận |
|---|---|---|---|
| AUTH-01 | PASS | `tests/auth/auth-login.spec.js` | Superuser cấu hình; login hợp lệ và vào được trang xác thực. |
| AUTH-02 | PASS | `tests/auth/auth-login.spec.js` | Credential không hợp lệ bị từ chối. |
| AUTH-03 | PASS | `tests/auth/auth-login.spec.js` | User inactive do run tạo; login bị từ chối. |
| AUTH-04 | PASS | `tests/auth/auth-throttle.spec.js` | User tạm do run tạo; số lần thử có giới hạn kích hoạt throttle. |
| AUTH-05 | PASS | `tests/auth/auth-session.spec.js` | Context ẩn danh không truy cập được trang hardware được bảo vệ. |
| AUTH-06 | PASS | `tests/auth/auth-session.spec.js` | Session cũ không truy cập lại được sau logout. |
| AUTHZ-01 | PASS | `tests/authz/authz-view.spec.js` | Superuser đã xác minh vào được trang quản lý tài sản. |
| AUTHZ-02 | PASS | `tests/authz/authz-view.spec.js` | User do run tạo không có `assets.view`; truy cập bị từ chối. |
| AUTHZ-03 | PASS | `tests/authz/authz-edit.spec.js` | User không có quyền edit; thao tác bị từ chối và Asset không đổi. |
| AUTHZ-04 | PASS | `tests/authz/authz-delete.spec.js` | User không có quyền delete; thao tác bị từ chối, Asset còn. |
| AUTHZ-05 | PASS | `tests/authz/authz-company.spec.js` | Group allow và quyền cá nhân deny; quyền hiệu lực từ chối truy cập. |
| AUTHZ-06 | SKIPPED / BLOCKED trong summary | `tests/authz/authz-company.spec.js` | Cần FMCS và Company fixture đã xác minh; FMCS chưa bật. |
| ASSET-01 | PASS | `tests/asset/asset-create.spec.js` | Model/Status được chọn động; Asset tag riêng và record đọc lại được. |
| ASSET-02 | PASS | `tests/asset/asset-create.spec.js` | Thiếu trường bắt buộc bị từ chối; không có record tương ứng. |
| ASSET-03 | PASS | `tests/asset/asset-create.spec.js` | Asset tag trùng bị từ chối; Asset gốc còn. |
| ASSET-04 | FAIL | `tests/asset/asset-validation.spec.js` | 5 subtest biên/định dạng; giá trị warranty 241 được chấp nhận, trái với assertion mong HTTP 422 hoặc JSON `status: error`. Các subtest input không hợp lệ khác bị từ chối. Nguyên nhân/yêu cầu nghiệp vụ: CẦN XÁC NHẬN. |
| ASSET-05 | PASS | `tests/asset/asset-update.spec.js` | Thay đổi Asset của run được đọc lại đúng giá trị. |
| ASSET-06 | PASS | `tests/asset/asset-update.spec.js` | ID/dữ liệu update không hợp lệ trả business error; không có thay đổi ngoài ý muốn. |
| ASSET-07 | PASS | `tests/asset/asset-delete.spec.js` | Asset của run soft-delete; không còn trong inventory active. |
| API-01 | PASS | `tests/api/api-auth.spec.js` | Request thiếu Bearer bị từ chối với JSON unauthorized. |
| API-02 | PASS | `tests/api/api-auth.spec.js` | Bearer không hợp lệ bị từ chối. |
| API-03 | PASS | `tests/api/api-permission.spec.js` | Xác minh owner token; thiếu `assets.create` thì thao tác bị từ chối. |
| API-04 | PASS | `tests/api/api-asset.spec.js` | Token của run tạo Asset; JSON thành công và record đọc lại đúng. |
| API-05 | PASS | `tests/api/api-asset.spec.js` | Dữ liệu tạo không hợp lệ/trùng bị từ chối; không tạo thêm Asset. |
| API-06 | PASS | `tests/api/api-asset.spec.js` | Update ID không tồn tại trả business error trong JSON. |
| COOKIE-01 | PASS | `tests/cookie/cookie-session.spec.js` | Đọc cookie thực tế; HTTP ghi nhận HttpOnly=true, SameSite=Lax, Secure=false. |
| COOKIE-02 | PASS | `tests/cookie/cookie-session.spec.js` | Session thay đổi sau login và không dùng lại được sau logout. |
| COOKIE-03 | PASS | `tests/cookie/cookie-csrf.spec.js` | POST thiếu CSRF không tạo Asset; control có CSRF tạo rồi cleanup xác minh. |
| COOKIE-04 | SKIPPED / BLOCKED trong summary | `tests/cookie/cookie-csrf.spec.js` | Cần HTTPS để kiểm tra Secure; target hiện là HTTP. |

## Thiết kế dependency và cleanup

- Case có mutation yêu cầu fixture riêng theo RUN_ID; không dùng data do case
  trước tạo.
- Permission cases tạo User/Group/token run-owned đúng nhu cầu; không dùng
  Superuser thay User thường.
- API token gắn với owner cụ thể, không log value và được revoke.
- Asset tag là duy nhất; thao tác duplicate chỉ dựa trên fixture của chính
  case. Catalog có sẵn chỉ đọc.
- Teardown và global cleanup xác minh prefix, ID, identity trước thao tác
  xóa/revoke. Dữ liệu mẫu không đủ điều kiện cleanup.
- Hai full run trước đây ghi nhận fingerprint inventory active khớp baseline.
  Summary của RUN_ID `20261127142336-FDB59D` cũng ghi nhận cleanup và tám
  fingerprint inventory khớp baseline.

## Lịch sử kết quả đã lưu trước lượt mới nhất

| Lượt | RUN_ID | PASS | FAIL | Trạng thái chờ điều kiện | Ghi chú |
|---|---|---:|---:|---:|---|
| Full run cũ 1 | `20261127141228-F92D1A` | 25 | 2 | 2 BLOCKED | API-03 lỗi tên token vượt giới hạn; ASSET-04 ghi nhận warranty 241 được nhận. |
| Full run cũ 2 | `20261127141633-ACA2D0` | 26 | 1 | 2 BLOCKED | API-03 pass sau rút ngắn tên token; ASSET-04 vẫn fail. |
| Lượt được cung cấp gần nhất; summary `2026-11-27T14:26:40Z` | `20261127142336-FDB59D` | 26 | 1 | 2 SKIPPED (raw); 2 BLOCKED (summary) | 34 executions: 31 pass, 1 fail, 2 skipped; cleanup và fingerprint được summary xác nhận. |

Các lượt cũ ghi `BLOCKED` ở cấp case; raw output lượt mới nhất ghi
`SKIPPED` cho hai execution, còn summary generator ánh xạ case thành
`BLOCKED`. Đối chiếu evidence trong
[summary đã sinh](../reports/test-summary.md) và
[raw JSON](../test-results/playwright-results.json) theo đúng RUN_ID.

## Các điểm cần xác nhận

- `ASSET-04`: xác nhận yêu cầu nghiệp vụ cho `warranty_months=241` và report
  mới nhất trước khi kết luận nguyên nhân. Không sửa assertion/logic để ép PASS.
- `AUTHZ-06`: cần môi trường FMCS được cấu hình sẵn.
- `COOKIE-04`: cần HTTPS test endpoint.
- Các thư mục report/result bị ignore trong Git; khi chia sẻ cần đính kèm hoặc
  lưu an toàn artifact của đúng RUN_ID.

Không có mã case nào chưa được triển khai. Hai case SKIPPED vẫn có code và
precondition check.
