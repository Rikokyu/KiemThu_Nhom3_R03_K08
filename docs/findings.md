# Kết quả DAST và Findings

> Tổng hợp theo report và evidence hiện có. Cảnh báo scanner không đồng nghĩa
> với defect hoặc lỗ hổng khai thác được nếu chưa xác minh độc lập.

## Thông tin lượt quét được lưu

| Run ID | Ngày | Snipe-IT | ZAP | Target | Người ghi nhận | Report |
|---|---|---|---|---|---|---|
| RUN-01 | 16/10/2026 | `v8.8.0`, SHA `2c466fa8a5a68525439bf1bbbc24470d6670c516` | **CẦN XÁC NHẬN phiên bản** | `http://localhost:8000` | Ngô Văn Chương (DAST) / Đỗ Duy Biên (tổng hợp) | [HTML report RUN-01](../reports/RUN-01-20261016-zap-report.html) |

Ảnh tổng quan: [RUN-01-zap-summary.png](../evidence/screenshots/findings%20run/RUN-01-zap-summary.png).

## Test Case ID và Finding ID

`FIND-01`…`FIND-06` là mã Finding trong báo cáo; không phải mã Test Case.
CSV DAST hiện có mã `TC_AUTH_*`, `TC_AUTHZ_*`, `TC_ASSET_*`, `TC_API_*`,
`TC_COOKIE_001`, `TC_ZAP_001` và `TC_ZAP_002`. Các mã `TC_DAST_04`,
`TC_DAST_05`, `TC_DAST_06` trong report gốc không có trong CSV hiện tại.
Không đổi mã gốc hoặc tự ghép sang `TC_ZAP_*`; liên kết chính xác đang
**CẦN XÁC NHẬN** với nhóm.

| Finding | Mã ghi trong report gốc | Đối chiếu với bộ CSV hiện tại | Mô tả | Mức ZAP | Trạng thái |
|---|---|---|---|---|---|
| FIND-01 | `TC_DAST_04` | CẦN XÁC NHẬN | ZAP cảnh báo bất thường kiểu SQL injection ở tham số sắp xếp API Users | High | Chưa xác minh |
| FIND-02 | `TC_DAST_05` | CẦN XÁC NHẬN | Cảnh báo thiếu CSP trên `/login` trong RUN-01 | Medium | Không tái hiện ở đối chiếu 24/11/2026; CSP có nhưng còn directive lỏng |
| FIND-03 | `TC_DAST_04` | CẦN XÁC NHẬN | Input dài tới Livewire endpoint nhận response HTTP 500; ZAP gắn nhãn Buffer Overflow | Medium | Report gốc gọi nhãn này false positive; HTTP 500 được ghi nhận, nguyên nhân cần xác minh |
| FIND-04 | `TC_DAST_06` | CẦN XÁC NHẬN | Bundle JavaScript có Bootstrap `3.3.4` | Medium | Đã xác minh phiên bản có trong bundle; chưa xác minh khai thác |
| FIND-05 | `TC_DAST_05` | CẦN XÁC NHẬN | Cảnh báo thiếu một số security header và tiết lộ thông tin server | Low | Quan sát được trong RUN-01; HSTS cần đánh giá trên HTTPS |
| FIND-06 | `TC_DAST_05` | CẦN XÁC NHẬN | Cookie `XSRF-TOKEN` không có cờ HttpOnly | Low | Được phân loại false positive theo cơ chế CSRF/Laravel |

Các screenshot gốc được giữ nguyên:

- [FIND-01](../evidence/screenshots/findings%20run/FIND-01-sqli-users-order.png)
- [FIND-02](../evidence/screenshots/findings%20run/FIND-02-missing-csp.png)
- [FIND-03](../evidence/screenshots/findings%20run/FIND-03-livewire-500.png)
- [FIND-04](../evidence/screenshots/findings%20run/FIND-04-bootstrap-334.png)
- [FIND-05](../evidence/screenshots/findings%20run/FIND-05-server-headers.png)
- [FIND-06](../evidence/screenshots/findings%20run/FIND-06-xsrf-cookie.png)
- [Header sample đã làm sạch](../evidence/logs/RUN-01-headers-sample.txt)

## Chi tiết, ảnh hưởng và xử lý đề xuất

### FIND-01 — Cảnh báo tham số sắp xếp API Users

- **Quan sát:** report ZAP gắn cảnh báo SQL injection cho truy vấn API Users.
- **Xác minh:** chưa tái hiện độc lập bằng một request/response baseline và
  đối chứng được lưu trong repository. Chưa có bằng chứng đọc/ghi dữ liệu.
- **Ảnh hưởng:** nếu xác nhận đầu vào ảnh hưởng câu truy vấn, có thể có rủi ro
  với tính toàn vẹn hoặc bảo mật dữ liệu; hiện chưa kết luận mức ảnh hưởng
  thực tế.
- **Đề xuất:** chủ sở hữu ứng dụng kiểm tra allowlist/sanitization cho tham
  số sắp xếp và log truy vấn; nhóm chỉ cập nhật Finding sau khi retest an toàn
  trên lab. Mã case đối chiếu **CẦN XÁC NHẬN**.
- **Evidence:** [report RUN-01](../reports/RUN-01-20261016-zap-report.html),
  [ảnh](../evidence/screenshots/findings%20run/FIND-01-sqli-users-order.png).

### FIND-02 — Cảnh báo Content-Security-Policy

- **Quan sát:** ZAP báo thiếu CSP trên `/login` trong RUN-01 ngày 16/10/2026.
- **Đối chiếu:** ghi nhận ngày 24/11/2026 trên Docker `v8.8.0` có CSP header;
  một số directive được mô tả là cho phép nguồn inline/eval. Vì vậy cảnh báo
  thiếu header không tái hiện ở lần đối chiếu này; cấu hình hiện có vẫn cần
  đánh giá riêng.
- **Ảnh hưởng:** CSP yếu có thể giảm hiệu quả phòng vệ phía trình duyệt; chưa
  có bằng chứng khai thác XSS trong hồ sơ này.
- **Đề xuất:** rà soát directive theo ứng dụng và kiểm tra lại header trên
  đúng bản dựng. Không xem CSP yếu là bằng chứng XSS.
- **Evidence:** [report RUN-01](../reports/RUN-01-20261016-zap-report.html),
  [ảnh](../evidence/screenshots/findings%20run/FIND-02-missing-csp.png),
  [header sample](../evidence/logs/RUN-01-headers-sample.txt).

### FIND-03 — HTTP 500 với input dài

- **Quan sát:** report ghi response HTTP 500/ngắt kết nối tại
  `/livewire/update`; ZAP gắn nhãn Buffer Overflow.
- **Xác minh:** response lỗi được ghi nhận, nhưng nhãn Buffer Overflow không
  chứng minh lỗi tràn bộ nhớ. Chưa có log phía ứng dụng trong bằng chứng hiện
  có để xác định nguyên nhân. Report gốc phân loại nhãn Buffer Overflow là
  false positive; việc phân loại đó không xác định nguyên nhân của HTTP 500.
- **Ảnh hưởng:** lỗi server có thể ảnh hưởng độ ổn định; mức ảnh hưởng cần
  được xác định từ log và khả năng tái hiện có kiểm soát.
- **Đề xuất:** kiểm tra log ứng dụng và validation của endpoint; phân loại lại
  sau khi xác định exception. Không kết luận buffer overflow từ HTTP 500.
- **Evidence:** [report RUN-01](../reports/RUN-01-20261016-zap-report.html),
  [ảnh](../evidence/screenshots/findings%20run/FIND-03-livewire-500.png).

### FIND-04 — Bootstrap 3.3.4 trong JavaScript bundle

- **Quan sát đã xác minh:** bundle `/js/dist/all.js` chứa Bootstrap `3.3.4`.
  Các advisory/CVE được report gốc nêu là căn cứ cảnh báo về phiên bản.
- **Giới hạn:** sự hiện diện của thư viện cũ không chứng minh ứng dụng có
  đường khai thác XSS khả dụng; chưa có luồng khai thác được kiểm chứng.
- **Ảnh hưởng:** cần xác định component và chức năng phụ thuộc trước khi
  đánh giá rủi ro thực tế.
- **Đề xuất:** kiểm tra dependency/build manifest và kế hoạch nâng cấp tương
  thích; kiểm thử lại luồng dùng component liên quan trước khi kết luận.
- **Evidence:** [report RUN-01](../reports/RUN-01-20261016-zap-report.html),
  [ảnh](../evidence/screenshots/findings%20run/FIND-04-bootstrap-334.png).

### FIND-05 — Security headers và thông tin server

- **Quan sát:** report RUN-01 ghi nhận thiếu `X-Content-Type-Options` trên
  một số tài nguyên tĩnh và header `Server` tiết lộ phiên bản phần mềm.
- **HSTS:** target RUN-01 dùng HTTP. HSTS chỉ có ý nghĩa khi triển khai HTTPS;
  không coi việc thiếu HSTS trên HTTP là một kết luận lỗi đã xác minh.
- **Ảnh hưởng:** header server có thể hỗ trợ fingerprinting; thiếu
  `X-Content-Type-Options` có thể làm giảm một lớp bảo vệ trình duyệt.
- **Đề xuất:** xác minh response trên các endpoint hiện tại; đánh giá HSTS
  riêng sau khi có HTTPS và rà soát cấu hình header trên static assets.
- **Evidence:** [report RUN-01](../reports/RUN-01-20261016-zap-report.html),
  [ảnh](../evidence/screenshots/findings%20run/FIND-05-server-headers.png),
  [header sample](../evidence/logs/RUN-01-headers-sample.txt).

### FIND-06 — Cookie XSRF-TOKEN không có HttpOnly

- **Quan sát:** cookie `XSRF-TOKEN` không có HttpOnly; report phân loại đây là
  false positive theo cơ chế Laravel cho phép JavaScript đọc CSRF token để
  gửi trong request. Cookie này khác cookie session.
- **Ảnh hưởng:** hiện chưa có bằng chứng giá trị cookie này chứa session
  credential hoặc tạo thành lỗ hổng độc lập.
- **Đề xuất:** giữ phân biệt XSRF token và session cookie; tiếp tục xác minh
  thuộc tính của session cookie riêng, không áp dụng yêu cầu HttpOnly của
  session một cách máy móc cho XSRF token.
- **Evidence:** [report RUN-01](../reports/RUN-01-20261016-zap-report.html),
  [ảnh đã che giá trị](../evidence/screenshots/findings%20run/FIND-06-xsrf-cookie.png).

## Lưu ý trạng thái

Các trạng thái ở đây mô tả từng Finding, không phải trạng thái test case trong
CSV. Bộ `TC_*` hiện vẫn có các dòng `NOT RUN`; report DAST và Finding evidence
không tự thay thế actual result từng case. Mapping mã legacy và kết quả case
`TC_ZAP_*` cần nhóm xác nhận trước khi cập nhật CSV.
