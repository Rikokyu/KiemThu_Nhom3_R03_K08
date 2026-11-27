# Yêu cầu dữ liệu kiểm thử

## Baseline instance đã ghi nhận

Môi trường kiểm thử là Snipe-IT `http://localhost:8000`. Snapshot hoạt động
dùng cho hai full run ngày 27/11/2026 ghi nhận:

| Loại dữ liệu | Bản ghi active qua API | Ghi chú |
|---|---:|---|
| Models | 18 | Chọn động model phù hợp, không dựa ID cố định. |
| Status Labels | 7 | Chọn động nhãn deployable. |
| Categories | 20 | Chỉ đọc dữ liệu nền. |
| Companies | 111 | FMCS chưa bật. |
| Locations | 21 | Chỉ đọc dữ liệu nền. |
| Users | 2,107 | Admin cấu hình đã được xác minh Superuser trong các lượt có report. |
| Groups | 1 | Group có sẵn chỉ dùng làm dữ liệu đọc. |
| Assets | 2,559 | Tổng database ghi nhận 2,609; API active không liệt kê 50 Archived. |

Đây là số liệu của snapshot lịch sử, có thể thay đổi. Lượt gần nhất
`20261127142336-FDB59D` có summary xác nhận cleanup và các inventory
fingerprint khớp baseline. Không sửa/xóa dữ liệu nền. User/Asset do test tạo
có thể được soft-delete theo hành vi ứng dụng; token bị revoke.

Lần điều tra ban đầu chưa có API token dùng được. Test hiện tạo token ngắn
hạn cho user do chính lượt chạy tạo, xác minh owner/sử dụng, sau đó revoke.
Không ghi token value vào tài liệu.

## Điều kiện trước khi chạy

1. Khởi chạy đúng instance Snipe-IT local và xác nhận URL.
2. Tạo `automation/.env` từ `.env.example`, đặt `BASE_URL`,
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
3. Chạy `npm run test:list` trong `automation/` để kiểm tra phát hiện test.
4. Chạy `npm run test:full`. Global setup phải xác thực Admin và quyền
   Superuser trước khi đọc inventory/chuẩn bị dữ liệu; thất bại thì dừng.
5. Đối chiếu Run ID, thời điểm và cleanup trong report/manifest. Không commit
   `.env`, `.cache` hoặc output chưa rà soát.

## Các trường liên quan

- Asset cần Model và Status Label hợp lệ. Fixture tìm các bản ghi active bằng
  API; không hard-code ID. Web form gửi `asset_tags[1]`/`serials[1]`, API
  dùng `asset_tag`/`serial`.
- Asset Tag automation có prefix `AUTO-TEST-<RUN_ID>-...`; API đọc lại record
  sau tạo để xác minh identity.
- User test có username dạng `pw_<RUN_ID>_...`; permission/group chỉ cấu hình
  cho user do lượt chạy tạo. Không dùng Superuser làm User thường.
- API token thuộc test user cụ thể; ownership được xác minh, value không ghi
  vào report và token bị revoke trong cleanup.

## API và phân trang

Global setup đọc qua session Admin đã xác minh; API test dùng token của
identity kiểm thử. Endpoint danh sách cần quyền `*.view` tương ứng. Khả năng
đọc toàn bộ records được xác minh qua pagination; client dùng thứ tự ID tăng
dần để tránh thứ tự mặc định không ổn định.

| Loại | GET | Tạo/xóa khi test | Phân trang |
|---|---|---|---|
| Models | `/api/v1/models` | Không tạo/sửa dữ liệu nền | Có; đọc hết metadata/next page, sắp ID tăng dần |
| Status Labels | `/api/v1/statuslabels` | Không tạo/sửa dữ liệu nền | Có |
| Categories | `/api/v1/categories` | Không tạo/sửa dữ liệu nền | Có |
| Companies | `/api/v1/companies` | Không tạo/sửa dữ liệu nền | Có |
| Locations | `/api/v1/locations` | Không tạo/sửa dữ liệu nền | Có |
| Users | `/api/v1/users` | Provision qua UI; cleanup `/api/v1/users/{id}` | Có |
| Groups | `/api/v1/groups` | Provision qua UI; cleanup `/api/v1/groups/{id}` | Có |
| Assets | `/api/v1/hardware` | POST/PATCH/DELETE `/api/v1/hardware` | Có |
| Personal tokens | `/api/v1/account/personal-access-tokens` | POST/DELETE cùng endpoint | List theo owner; token value chỉ có lúc tạo |

HTTP status riêng lẻ không đủ kết luận thành công. Test kiểm tra JSON business
result và đọc lại record sau mutation khi phù hợp.

## Hạn chế môi trường hiện ghi nhận

- `AUTHZ-06` cần FMCS đã bật và các Company fixture đã xác nhận; automation
  không tự đổi cấu hình hệ thống.
- `COOKIE-04` cần HTTPS để kiểm tra Secure; target ghi nhận hiện là HTTP.
- `ASSET-04` kiểm tra input `warranty_months=241`; lượt gần nhất người dùng
  cung cấp ghi nhận giá trị được chấp nhận trong khi assertion mong từ chối.
  Đây là sai khác quan sát được; yêu cầu nghiệp vụ và nguyên nhân cần
  **CẦN XÁC NHẬN**, không tự kết luận defect.
