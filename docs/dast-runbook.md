# Runbook DAST với OWASP ZAP

> Phụ trách ZAP theo phân công hiện có: Nguyễn Lê Anh Tuấn. Ngô Văn Chương
> phối hợp phân tích chức năng/URL. Phiên bản ZAP và profile dùng trong lần
> quét hiện chưa được xác minh (`CẦN XÁC NHẬN`).

## 1. Phạm vi và phân biệt phương pháp

DAST (Dynamic Application Security Testing — kiểm thử bảo mật động) quan sát
request/response của ứng dụng đang chạy. Bộ case DAST/thủ công có mã
`TC_*`, trong đó `TC_ZAP_001` tập trung HTTP security headers và
`TC_ZAP_002` ghi nhận, phân loại cảnh báo ZAP. Bộ Playwright là automation
chức năng riêng, dùng các mã `AUTH-*`, `AUTHZ-*`, `ASSET-*`, `API-*` và
`COOKIE-*`; xem [báo cáo automation](../automation/docs/FINAL_TEST_REPORT.md).

Target đã ghi nhận trong báo cáo DAST:

```text
http://localhost:8000
```

Chỉ kiểm thử instance lab này khi được phép. Không dùng domain/IP bên ngoài
scope. Passive scan phân tích lưu lượng đã thu thập; active scan gửi thêm
request và có thể thay đổi dữ liệu hoặc tạo tải.

## 2. Thông tin đã xác minh và còn thiếu

| Thông tin | Giá trị |
|---|---|
| Snipe-IT | `v8.8.0`, commit `2c466fa8a5a68525439bf1bbbc24470d6670c516` |
| Target | `http://localhost:8000` |
| ZAP phiên bản | **CẦN XÁC NHẬN** từ `Help/About` của máy đã dùng |
| ZAP image/profile/context | **CẦN XÁC NHẬN**; chưa có file cấu hình trong repository |
| Cấu hình xác thực ZAP | **CẦN XÁC NHẬN**; không có cấu hình đã làm sạch được bàn giao |
| Report đã lưu | [`RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html) |
| Findings và ảnh | [findings.md](findings.md), thư mục [`evidence/`](../evidence/) |

`dast/config/` và `dast/scripts/` hiện chỉ có README quy ước, chưa có cấu hình
hay script chạy DAST đã xác minh. Vì vậy không suy đoán image tag, context,
authentication method, policy hoặc lệnh CLI. Ảnh hướng dẫn ZAP hiện có tại
[`Tài liệu cài đặt ozap.docx`](T%C3%A0i%20li%E1%BB%87u%20c%C3%A0i%20%C4%91%E1%BA%B7t%20ozap.docx)
chỉ là tài liệu hỗ trợ thao tác, không thay thế phiên bản/profile thực tế.

## 3. Chuẩn bị trước khi chạy

1. Đọc [version-lock.md](version-lock.md), [setup-docker.md](setup-docker.md)
   và [test-environment.md](test-environment.md). Xác nhận đúng lab local,
   SHA ứng dụng và quyền kiểm thử.
2. Xác nhận ZAP version từ giao diện **Help/About**; ghi version/date/operator
   vào run record. Không ghi password, token, cookie hoặc file session thô.
3. Mở/khôi phục ZAP theo phiên bản đã xác nhận. Thiết lập target/context chỉ
   gồm `http://localhost:8000`; ghi rõ include/exclude và xác nhận không có
   host ngoài scope trong History/Sites.
4. Nếu cần đăng nhập, dùng tài khoản lab riêng. Cách cấu hình xác thực ZAP
   hiện chưa được ghi nhận; cần xác nhận với người đã thực hiện trước khi
   tuyên bố đã quét authenticated pages.
5. Tạo/kiểm tra dữ liệu giả lập và xác nhận phương án khôi phục trước active
   scan. Không reset database để chạy lại automation.

## 4. Thu thập và quét

1. Dùng trình duyệt proxied bởi ZAP để Manual Explore các luồng nằm trong
   scope. Nếu chưa xác nhận đăng nhập/context, chỉ thu thập trang công khai
   và ghi rõ giới hạn.
2. Kiểm tra Sites/History để chắc rằng request chỉ thuộc target đã duyệt.
3. Chạy passive analysis trên traffic đã thu thập. Ghi thời gian, URL/nhóm
   luồng, status và cảnh báo; không coi alert đơn lẻ là defect đã xác nhận.
4. Chỉ chạy active scan sau khi người phụ trách xác nhận target, scope, quyền,
   dữ liệu có thể bị tác động và khả năng khôi phục. Đặt giới hạn theo scope
   đã duyệt; dừng ngay nếu xuất hiện request ra ngoài phạm vi.
5. Lần RUN-01 có report và findings được lưu; cấu hình chi tiết để tái lập
   lần đó chưa có đầy đủ trong repository (`CẦN XÁC NHẬN`).

## 5. Xuất report và cập nhật findings

1. Xuất report từ phiên ZAP sau khi kiểm tra target và nội dung. Report mẫu
   hiện có tại `reports/RUN-01-20261016-zap-report.html`.
2. Lưu file mới dưới `reports/` với Run ID/ngày; trước khi chia sẻ, rà soát
   cookie, token, password, dữ liệu cá nhân và host ngoài scope.
3. Gắn ảnh/log đã làm sạch trong `evidence/screenshots/` và `evidence/logs/`.
   Không thay thế hoặc xóa evidence đã có khi chưa được nhóm đồng ý.
4. Cập nhật actual result và evidence trong CSV/case report chỉ khi xác định
   rõ case ID. Finding có mã riêng dạng `FIND-nn`, không phải Test Case ID.
   Các mã `TC_DAST_04`/`TC_DAST_05`/`TC_DAST_06` trong report cũ không có trong
   CSV hiện tại; mapping với `TC_ZAP_001`/`TC_ZAP_002` đang
   **CẦN XÁC NHẬN**.
5. Phân biệt alert, quan sát được tái hiện và lỗ hổng khai thác được. Báo cáo
   phải nêu mức độ tin cậy, giới hạn và trạng thái xác minh; không kết luận
   vulnerability chỉ từ tên alert.

## 6. Báo cáo lần chạy

Ghi tối thiểu:

- Run ID, ngày/giờ, người chạy, target và SHA Snipe-IT.
- ZAP version, profile/context/auth nếu dùng; các thông tin này hiện
  **CẦN XÁC NHẬN** cho RUN-01.
- Chế độ passive/active, scope, luồng đã khám phá và tổng quan kết quả.
- Link report/evidence; trạng thái từng case và findings.
- Các giới hạn, cảnh báo chưa tái hiện và cách khôi phục dữ liệu.

Không ghi credential hoặc giá trị token/cookie vào run record. Xem thêm
[checklist DAST](../test-cases/dast-checklist.md) và
[quy tắc lưu reports](../reports/README.md).
