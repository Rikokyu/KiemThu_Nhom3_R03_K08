# Quản lý dữ liệu kiểm thử

## RUN_ID và manifest

`global-setup.js` tạo `RUN_ID` sau khi đăng nhập Admin và xác minh quyền
Superuser. Baseline inventory và fixture catalog được lưu tại
`automation/.cache/current-run.json`. Mọi đối tượng được tạo sẽ có entry trong
`automation/.cache/managed-data-<RUN_ID>.json`, gồm loại, ID, identity,
metadata ownership, state và kết quả cleanup.

Username do automation tạo có dạng `pw_<RUN_ID>_...`; Asset Tag, Group và tên
token dùng prefix `AUTO-TEST-<RUN_ID>-...`. Manifest không lưu password,
session cookie, CSRF value hoặc token value. Password sinh cho account được
lưu tạm trong file local bị ignore và xóa sau cleanup.

## Vòng đời fixture

1. Đăng nhập bằng `ADMIN_USERNAME` và `ADMIN_PASSWORD` từ `.env`.
2. Xác minh identity Admin và quyền Superuser trước khi chuẩn bị dữ liệu.
3. Đọc Models, Status Labels, Categories, Companies, Locations, Users, Groups
   và Assets bằng API đã phân trang.
4. Chọn động Model/Status hợp lệ; không giả định ID cố định.
5. Mỗi test tạo user/group/token/Asset riêng theo nhu cầu.
6. Kiểm tra JSON business result và đọc lại dữ liệu đã tạo/sửa.
7. Cleanup theo quan hệ phụ thuộc: Asset, token thuộc owner, User, Group.
8. Đọc lại inventory active và so sánh fingerprint với baseline.

Dữ liệu nền chỉ đọc. User test không phải Superuser; case quyền dùng identity
và permission riêng. Test độc lập về dữ liệu, không dùng Asset do case trước
tạo.

## Bảo vệ cleanup và khôi phục

Trước khi xóa/revoke, cleanup xác minh:

- Manifest entry thuộc `RUN_ID` đang xử lý.
- Identity có đúng prefix của lượt chạy.
- ID hiện tại khớp đúng Asset Tag, Username, Group name hoặc tên token và owner.
- Nếu entry chưa có ID, exact identity lookup không được mơ hồ; nhiều kết quả
  khiến cleanup dừng.
- Response xóa/revoke và trạng thái sau thao tác được kiểm tra.

Admin/Superuser và dữ liệu có sẵn không đủ điều kiện cleanup. Snipe-IT có thể
soft-delete User/Asset; record có thể còn trong database nhưng không còn trong
inventory active. Token được revoke. Cleanup không purge soft-deleted record
và không đổi system settings.

Fixture teardown chạy khi test lỗi; global teardown tiếp tục xử lý manifest
còn lại. Nếu tiến trình bị dừng, chạy:

```powershell
npm run test:data-cleanup
```

Lệnh chỉ thao tác theo manifest hiện hành. Nếu không xác minh được ownership,
credential hoặc identity thì dừng và báo entry chưa xử lý, không đoán/xóa.

## Baseline và khả năng lặp lại đã ghi nhận

Snapshot active lịch sử: 18 Models, 7 Status Labels, 20 Categories, 111
Companies, 21 Locations, 2,107 Users, 1 Group và 2,559 Assets. Database có
2,609 Assets tổng, trong đó API active không liệt kê 50 Archived. Hai lượt
full run trước đó và RUN_ID `20261127142336-FDB59D` có summary xác nhận
cleanup/fingerprint. Raw JSON và summary hiện tại nằm trong thư mục bị ignore.
Xem [báo cáo triển khai](TEST_DATA_IMPLEMENTATION_REPORT.md) và
[báo cáo cuối](FINAL_TEST_REPORT.md).

Client có bounded retry theo `Retry-After` khi gặp rate limit. Không tăng
worker để ép tốc độ; `playwright.config.js` hiện chạy một worker.

## Bảo vệ bí mật

`.env`, `.cache/`, Playwright results và reports bị ignore. `.env.example` chỉ
có giá trị minh họa. Không đưa credential/session/token vào assertion message,
annotation, log, report hoặc Git. Screenshot và trace đang tắt trong config.
