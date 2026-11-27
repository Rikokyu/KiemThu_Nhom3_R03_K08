# Thiết kế chu kỳ kiểm thử Playwright

## 1. Phạm vi và nguồn dữ liệu

Tài liệu này mô tả bộ chức năng Playwright với 29 mã `AUTH-*`, `AUTHZ-*`,
`ASSET-*`, `API-*`, `COOKIE-*`. Bộ đó tách biệt với case thủ công/DAST `TC_*`
trong `docs/test-cases.md`; không dùng kết quả của bộ này làm kết quả bộ kia.

Thông tin instance và inventory trong mục dưới là snapshot lịch sử từ
27/11/2026, không khẳng định số lượng hiện tại của database. Snapshot được
đọc qua transaction chỉ đọc và API có xác thực. Không ghi password, token
value, session cookie hoặc dữ liệu password của user.

## 2. Inventory thực tế đã quan sát

| Loại / bảng | Số lượng lịch sử | ID/tên thực tế đã quan sát | Điều kiện fixture |
|---|---:|---|---|
| Models / `models` | 18 active | Xem bảng Models bên dưới; ví dụ ID 1 `Macbook Pro 13"` | Chọn động model active gắn category asset. |
| Status Labels / `status_labels` | 7 active | ID 1 `Ready to Deploy`, ID 2 `Pending`, ID 3 `Archived`, ID 4 `Out for Diagnostics`, ID 5 `Out for Repair`, ID 6 `Broken - Not Fixable`, ID 7 `Lost/Stolen` | Chọn động trạng thái deployable. |
| Categories / `categories` | 20 active | Xem bảng Categories bên dưới | Chỉ đọc; chọn category tương thích với model. |
| Companies / `companies` | 111 active | Ví dụ ID 1 `Johns, Gerhold and Block`, ID 2 `Pacocha PLC`, ID 3 `Bergstrom-Torp`, ID 111 `Langworth-Borer` | Không tự chọn cặp Company cho case cross-company. |
| Locations / `locations` | 21 active | Xem bảng Locations bên dưới | Chỉ đọc dữ liệu nền. |
| Users / `users` | 2,107 active | Ví dụ ID 1 `admin` / Admin User; ID 2 `snipe` / Snipe E. Head | Admin ID được resolve theo username lúc setup; không hard-code. |
| Groups / `permission_groups` | 1 | ID 1 `End User` | Group hiện có deny asset permissions; không sửa. |
| Assets / `assets` | 2,609 tổng, 2,559 active qua API | Ví dụ ID 1/tag `4508574169`; ID 2/tag `9755483190`; ID 3/tag `1649229559` | 50 bản ghi Archived không có trong active API listing; không sửa/xóa fixture nền. |
| OAuth access token | Không có token sử dụng được trong lần khảo sát đầu | Token được tạo trong các lượt kiểm tra lifecycle sau đó | Token do test tạo phải xác minh owner, không ghi value, revoke sau test. |

FMCS (`full_multiple_companies_support`) được ghi nhận tắt trong snapshot.
Không bật/tắt cấu hình hệ thống để chạy test.

### Models

| ID | Tên | Model number | Category ID |
|---:|---|---|---:|
| 1 | Macbook Pro 13" | 4916950313069669 | 1 |
| 2 | Macbook Air | 4916161486829398 | 1 |
| 3 | Surface | 6011339669193464 | 1 |
| 4 | XPS 13 | 6011610073737090 | 1 |
| 5 | Spectre | 4532431448096400 | 1 |
| 6 | ZenBook UX310 | 2327229756707235 | 1 |
| 7 | Yoga 910 | 4556665131231839 | 1 |
| 8 | iMac Pro | 5201364563507264 | 2 |
| 9 | Lenovo Intel Core i5 | 4539838834739976 | 2 |
| 10 | OptiPlex | 5040 (MRR81) | 2 |
| 11 | SoundStation 2 | 5544928329531713 | 6 |
| 12 | Polycom CX3000 IP Conference Phone | 4916851344417192 | 6 |
| 13 | iPad Pro | 4024007175734200 | 3 |
| 14 | Tab3 | 2422580026162468 | 3 |
| 15 | iPhone 11 | 6011998366936192 | 4 |
| 16 | iPhone 12 | 3528681845516750 | 4 |
| 17 | Ultrafine 4k | 4916592674948352 | 5 |
| 18 | Ultrasharp U2415 | 4716358720480192 | 5 |

### Categories

| ID | Tên | Loại |
|---:|---|---|
| 1 | Laptops | asset |
| 2 | Desktops | asset |
| 3 | Tablets | asset |
| 4 | Mobile Phones | asset |
| 5 | Displays | asset |
| 6 | VOIP Phones | asset |
| 7 | Conference Phones | asset |
| 8 | Keyboards | accessory |
| 9 | Mouse | accessory |
| 10 | Printer Paper | consumable |
| 11 | Printer Ink | consumable |
| 12 | HDD/SSD | component |
| 13 | RAM | component |
| 14 | Graphics Software | license |
| 15 | Office Software | license |
| 16 | Automated 5thgeneration emulation | accessory |
| 17 | Focused methodical utilisation | accessory |
| 18 | Configurable tangible protocol | asset |
| 19 | Streamlined logistical artificialintelligence | asset |
| 20 | Streamlined 24/7 hardware | asset |

### Locations

| ID | Tên |
|---:|---|
| 1 | East Gavin |
| 2 | Cassinshire |
| 3 | Eliseohaven |
| 4 | Millertown |
| 5 | West Elwyn |
| 6 | McDermottberg |
| 7 | West Stewart |
| 8 | McKenzieborough |
| 9 | Schmidtstad |
| 10 | Lake Enid |
| 11 | Blickstad |
| 12 | Lake Bridgettemouth |
| 13 | South Angelitafurt |
| 14 | Evieland |
| 15 | Paucekside |
| 16 | Mariahaven |
| 17 | New Emiliafort |
| 18 | Clarkshire |
| 19 | West Nathen |
| 20 | Addiehaven |
| 21 | New Clotilde |

## 3. API tra cứu và tạo dữ liệu

Trong lần khảo sát đầu, request thiếu bearer nhận HTTP 401; đây là lỗi xác
thực, không phải endpoint không tồn tại hay dữ liệu rỗng. Các lượt automation
sau đó đã dùng phiên Admin được xác minh và token cá nhân để đọc phân trang,
tạo fixture và kiểm tra vòng đời.

| Dữ liệu | GET endpoint | Quyền đọc | Trường quan tâm | Pagination |
|---|---|---|---|---|
| Models | `/api/v1/models` | `models.view` | `id`, `name`, `model_number`, category/fieldset | Có; đọc đến hết metadata/next page |
| Status Labels | `/api/v1/statuslabels` | `statuslabels.view` | `id`, `name`, deployable/pending/archived | Có |
| Categories | `/api/v1/categories` | `categories.view` | `id`, `name`, `category_type` | Có |
| Companies | `/api/v1/companies` | `companies.view` | `id`, `name`, `parent_id` | Có |
| Locations | `/api/v1/locations` | `locations.view` | `id`, `name`, `parent_id`, `company_id` | Có |
| Users | `/api/v1/users` | `users.view` | `id`, username, activation, company/location/group | Có |
| Groups | `/api/v1/groups` | quyền đọc group/Superuser theo controller | `id`, name, permission, user count | Có |
| Assets | `/api/v1/hardware` | `assets.view` | `id`, `asset_tag`, name, model/category/status, company/location | Có |
| Token owner | `/api/v1/users/me` | Bearer token hợp lệ | Identity owner token | Không |
| Personal token | `/api/v1/account/personal-access-tokens` | `self.api` | Token list/metadata của owner | Endpoint riêng theo owner |

Inventory client đi hết các trang response và sắp ID tăng dần để tránh thứ tự
Asset mặc định không ổn định. Các mutation cần kiểm tra JSON business result
và đọc lại dữ liệu, không chỉ dựa HTTP status.

Asset được tạo qua `POST /api/v1/hardware`, đọc qua
`GET /api/v1/hardware/{id}`, cập nhật qua `PATCH /api/v1/hardware/{id}` và
cleanup qua `DELETE /api/v1/hardware/{id}`. User/Group được provision qua UI;
cleanup qua endpoint theo ID. Token cá nhân tạo/list/revoke qua account token
endpoint. Danh mục và dữ liệu có sẵn chỉ đọc.

## 4. Thứ tự chạy và phụ thuộc

Runner cấu hình một worker để hạn chế tải/rate limit. Các test case được thiết
kế độc lập: mỗi test tạo fixture riêng, tự xác minh kết quả và cleanup; không
có case nào cần giữ Asset/User do case trước tạo. Thứ tự discovery không phải
quan hệ phụ thuộc nghiệp vụ.

Quy trình của một lượt:

1. **Preflight:** chỉ cho phép loopback; đăng nhập `ADMIN_USERNAME`; xác minh
   đúng username và quyền Superuser; chụp baseline inventory.
2. **Test:** chạy 29 mã case theo nhóm trong
   [case implementation report](TEST_CASE_IMPLEMENTATION_REPORT.md). Test có
   mutation nhận fixture riêng từ Test Data Manager.
3. **Teardown:** mỗi fixture cleanup đối tượng do chính test tạo; global
   teardown tiếp tục xử lý manifest còn lại và so sánh baseline khi có report.

### Dữ liệu case và cleanup

| Nhóm case | Fixture điển hình | Nguồn tạo | Dùng lại / cleanup |
|---|---|---|---|
| AUTH-01/02/05/06 | Superuser hiện có, invalid input, session riêng | Superuser đã xác minh hoặc browser context | Không xóa Admin; đóng context |
| AUTH-03/04 | User inactive/throttle riêng | Test Data Manager | Chỉ xóa User run-owned sau case |
| AUTHZ-01 | Superuser | Tài khoản hiện có đã xác minh | Không xóa/sửa |
| AUTHZ-02/03/04 | User theo permission riêng và Asset riêng nếu cần | Test Data Manager | Cleanup fixture của test |
| AUTHZ-05 | Group allow và User personal deny | Tạo riêng theo RUN_ID | Xóa User/Group chỉ sau khi xác minh ownership |
| AUTHZ-06 | Company-scoped User/Asset | Chưa tạo do FMCS tắt | SKIPPED đến khi môi trường đáp ứng |
| ASSET-01…07 | Model/Status catalog đọc động, Asset tag riêng | Catalog có sẵn chỉ đọc; Asset do test tạo | Mỗi test cleanup Asset riêng |
| API-01/02 | Request không token/token sai | Input không có credential hợp lệ | Không tạo dữ liệu |
| API-03…06 | User token/Asset riêng theo quyền | Test Data Manager | Revoke token, cleanup Asset/User |
| COOKIE-01…04 | Cookie/session context và CSRF control | Browser/test fixture | Đóng context; cleanup control Asset |

Case file và trạng thái từng mã có trong
[TEST_CASE_IMPLEMENTATION_REPORT.md](TEST_CASE_IMPLEMENTATION_REPORT.md).

## 5. Test Data Manager và cleanup

- `RUN_ID` được tạo sau preflight; identity có prefix run-owned.
- Manifest ghi ID, identity, state và kết quả cleanup; không lưu secret.
- Trước thao tác xóa/revoke, xác minh Run ID, exact prefix, ID, identity và
  owner. Nếu không chắc chắn, dừng cleanup thay vì xóa.
- Cleanup theo thứ tự dependency: Assets, token, Users, Groups; các thao tác
  có thể được tiếp tục từ manifest.
- Snipe-IT có thể soft-delete User/Asset; không purge dữ liệu đã soft-delete.
- So sánh inventory active trước/sau để phát hiện thay đổi dữ liệu nền.

Chi tiết implementation, yêu cầu dữ liệu và recovery:
[TEST_DATA_MANAGEMENT.md](TEST_DATA_MANAGEMENT.md),
[TEST_DATA_REQUIREMENTS.md](TEST_DATA_REQUIREMENTS.md),
[TEST_DATA_IMPLEMENTATION_REPORT.md](TEST_DATA_IMPLEMENTATION_REPORT.md).

## 6. Kết quả gần nhất và giới hạn

Lượt mới nhất có RUN_ID `20261127142336-FDB59D`; summary sinh lúc
`2026-11-27T14:26:40Z`. Kết quả: **34 executions, 31 PASS, 1 FAIL,
2 SKIPPED**, khoảng 3 phút 12 giây; ở cấp 29 mã case là 26 PASS, 1 FAIL,
2 case bị chặn bởi precondition. Summary xác nhận cleanup và cả tám inventory
fingerprint khớp baseline. Raw JSON gọi hai executions là `skipped`; summary
generator ánh xạ thành `BLOCKED` ở cấp case.

- `ASSET-04`: ứng dụng chấp nhận `warranty_months=241`, trong khi assertion
  mong HTTP 422 hoặc JSON `status: error`. Hiện tượng đã quan sát; nguyên nhân
  và yêu cầu nghiệp vụ cần xác nhận.
- `AUTHZ-06`: SKIPPED, FMCS/Company Scoping chưa bật.
- `COOKIE-04`: SKIPPED, target HTTP không cho xác minh cờ Secure.

Các lượt cũ đã lưu và baseline historical được ghi trong
[FINAL_TEST_REPORT.md](FINAL_TEST_REPORT.md). Không có source Snipe-IT hoặc
system configuration nào được sửa trong automation task.
