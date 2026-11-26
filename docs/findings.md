# Kết quả và phát hiện

> Phụ trách tổng hợp: Đỗ Duy Bien  
> Không coi cảnh báo scanner là defect đã xác nhận nếu chưa tái hiện/đối chiếu.

## Tóm tắt lần chạy

| Run ID | Ngày | Snipe-IT SHA | ZAP version | Target local | Người chạy | Report |
|---|---|---|---|---|---|---|
| RUN-01 | 16/10/2026 | `2c466fa8a5a68525439bf1bbbc24470d6670c516` (`v8.8.0`) | `<Điền phiên bản ZAP từ Ngô Văn Chương>` | `http://localhost:8000` | Ngô Văn Chương (DAST) / Đỗ Duy Bien (tổng hợp) | [`RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html) |

- **Ảnh tổng quan kết quả quét (Summary of Alerts):** [`RUN-01-zap-summary.png`](../evidence/screenshots/findings%20run/RUN-01-zap-summary.png)

## Danh sách phát hiện

| ID | Test case | Module/URL | Mô tả | Severity | Trạng thái xác minh | Evidence |
|---|---|---|---|---|---|---|
| FIND-01 | `TC_DAST_04` | API Users (`GET /api/v1/users`) | Cảnh báo SQL Injection trên tham số truy vấn `order` với payload `asc AND 1=1 -- ` | High | Chưa xác minh | [`FIND-01-sqli-users-order.png`](../evidence/screenshots/findings%20run/FIND-01-sqli-users-order.png) |
| FIND-02 | `TC_DAST_05` | Xác thực / Toàn trang (`GET /login`) | Thiếu HTTP response header `Content-Security-Policy` (CSP) | Medium | Không tái hiện | [`FIND-02-missing-csp.png`](../evidence/screenshots/findings%20run/FIND-02-missing-csp.png) |
| FIND-03 | `TC_DAST_04` | Livewire Endpoint (`POST /livewire/update`) | Gửi chuỗi dài (~2.500 ký tự) vào tham số `method` gây lỗi HTTP 500 (ZAP gắn nhãn Buffer Overflow) | Medium | False positive (nhãn Buffer Overflow) / Đã xác minh lỗi HTTP 500 | [`FIND-03-livewire-500.png`](../evidence/screenshots/findings%20run/FIND-03-livewire-500.png) |
| FIND-04 | `TC_DAST_06` | Tài nguyên tĩnh (`/js/dist/all.js`) | Đóng gói thư viện Bootstrap `3.3.4` đã lỗi thời, tồn tại các CVE XSS đã biết | Medium | Đã xác minh (phiên bản thư viện) | [`FIND-04-bootstrap-334.png`](../evidence/screenshots/findings%20run/FIND-04-bootstrap-334.png) |
| FIND-05 | `TC_DAST_05` | Tài nguyên tĩnh & Web Server (`*.js`, `*.css`, toàn site) | Thiếu `X-Content-Type-Options`, `Strict-Transport-Security` trên file tĩnh và lộ phiên bản `Apache/2.4.58 (Ubuntu)` | Low | Đã xác minh | [`FIND-05-server-headers.png`](../evidence/screenshots/findings%20run/FIND-05-server-headers.png) |
| FIND-06 | `TC_DAST_05` | Quản lý phiên / CSRF (`XSRF-TOKEN`) | Cookie `XSRF-TOKEN` không thiết lập cờ `HttpOnly` | Low | False positive (thiết kế chuẩn của Laravel) | [`FIND-06-xsrf-cookie.png`](../evidence/screenshots/findings%20run/FIND-06-xsrf-cookie.png) |

> **Ghi chú phạm vi test case:** Các test case `TC_DAST_01` (Truy cập khi chưa đăng nhập), `TC_DAST_02` (Phân quyền theo role) và `TC_DAST_03` (Vòng đời session) thuộc nhóm kiểm thử kiểm soát truy cập/phiên đang ở trạng thái `NOT RUN` trong `docs/test-cases.md` và chưa ghi nhận defect trong `RUN-01`.

---

## Chi tiết phát hiện

### FIND-01 — Cảnh báo SQL Injection trên tham số `order` của endpoint `GET /api/v1/users`

- **Test case liên quan:** `TC_DAST_04` (Xử lý dữ liệu đầu vào)
- **Nguồn/cảnh báo:** OWASP ZAP Active Scan — Alert: *SQL Injection* (`GET http://localhost:8000/api/v1/users?order=asc+AND+1%3D1+--+%20`).
- **Điều kiện và bước tái hiện:**
  1. Khởi chạy Snipe-IT `v8.8.0` tại `http://localhost:8000` theo `docs/setup-docker.md`.
  2. Gửi yêu cầu `GET /api/v1/users` kèm tham số truy vấn `order=asc AND 1=1 -- ` (đối chiếu cả trường hợp chưa gắn Bearer token và có Bearer token hợp lệ của tài khoản test trong `test-environment.md`).
  3. So sánh nội dung phản hồi và mã trạng thái HTTP với truy vấn chuẩn `order=asc` và truy vấn sai logic `order=asc AND 1=2 -- `.
- **Kết quả kỳ vọng/thực tế:**
  - *Kỳ vọng:* API chỉ chấp nhận giá trị sắp xếp hợp lệ (`asc` hoặc `desc`) và trả về mã lỗi `400 Bad Request` hoặc `422 Unprocessable Entity` đối với chuỗi chứa cú pháp SQL.
  - *Thực tế:* Công cụ ZAP ghi nhận phản hồi khớp điều kiện kiểm tra boolean-based và gắn cảnh báo mức độ *High*. Chưa có bằng chứng trích xuất dữ liệu hoặc độ trễ thời gian (time-based) từ kiểm thử thủ công.
- **Severity và căn cứ:** **High** (theo phân loại của OWASP ZAP đối với lỗ hổng tiêm nhiễm SQL; mức độ rủi ro thực tế phụ thuộc vào việc endpoint có yêu cầu xác thực API token và có thực thi biểu thức SQL trong câu lệnh `ORDER BY` hay không).
- **Trạng thái:** **Chưa xác minh** (cần tái hiện thủ công có kiểm soát với tài khoản lab để loại trừ khả năng false positive do phản hồi lỗi xác thực hoặc hành vi sắp xếp mặc định).
- **Nguyên nhân gốc:**
  - *Đã xác nhận:* Tham số `order` được truyền trực tiếp trên query string của `/api/v1/users`.
  - *Giả thuyết:* Bộ lọc đầu vào của API chưa áp dụng danh sách trắng (whitelist) nghiêm ngặt cho hướng sắp xếp `asc`/`desc` trước khi đưa vào truy vấn hoặc bộ phân tích của ZAP nhận diện nhầm phản hồi HTTP.
- **Evidence:**
  - Báo cáo quét: [`../reports/RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html)
  - Ảnh minh chứng đã làm sạch: [`../evidence/screenshots/findings%20run/FIND-01-sqli-users-order.png`](../evidence/screenshots/findings%20run/FIND-01-sqli-users-order.png)
- **Giới hạn:** Kết quả hiện tại mới dựa trên phát hiện tự động của ZAP trong RUN-01; chưa thực hiện tái hiện thủ công với API token hợp lệ để xác nhận khả năng khai thác thực tế.

---

### FIND-02 — Thiếu HTTP Response Header `Content-Security-Policy` (CSP)

- **Test case liên quan:** `TC_DAST_05` (HTTP security headers/cookie)
- **Nguồn/cảnh báo:** OWASP ZAP Passive Scan — Alert: *Content Security Policy (CSP) Header Not Set* (`GET http://localhost:8000/login` và các trang giao diện web).
- **Điều kiện và bước tái hiện:**
  1. Truy cập `http://localhost:8000/login` bằng trình duyệt và mở Chrome DevTools (`Network` $\rightarrow$ `login` $\rightarrow$ `Response Headers`).
  2. Kiểm tra danh sách HTTP Response Headers trả về từ máy chủ ứng dụng trên bản Docker đã khóa phiên bản (`v8.8.0`).
- **Kết quả kỳ vọng/thực tế:**
  - *Kỳ vọng:* Phản hồi HTTP bao gồm header `Content-Security-Policy` giới hạn nguồn tải script, style, frame và object hợp lệ.
  - *Thực tế:* Cảnh báo thiếu CSP xuất hiện ở lần quét `RUN-01` (`16/10/2026`); tuy nhiên khi tái hiện đối chiếu trực tiếp trên môi trường Docker khóa phiên bản `v8.8.0` (`24/11/2026`), phản hồi `GET /login` **đã có sẵn header `Content-Security-Policy`**, dù chỉ thị `script-src` vẫn cấu hình lỏng lẻo với `'unsafe-inline'` và `'unsafe-eval'`.
- **Severity và căn cứ:** **Medium** (theo phân loại ban đầu của OWASP ZAP).
- **Trạng thái:** **Không tái hiện** (trên bản dựng Docker `v8.8.0` đã khóa cấu hình chuẩn).
- **Nguyên nhân gốc:**
  - *Đã xác nhận:* Sự khác biệt cấu hình môi trường/biến `.env` giữa thời điểm quét thử nghiệm ban đầu (`16/10/2026`) và bản dựng Docker chuẩn được nhóm khóa phiên bản (`07/11/2026`).
- **Evidence:**
  - Báo cáo quét: [`../reports/RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html)
  - Ảnh minh chứng đối chiếu HTTP headers: [`../evidence/screenshots/findings%20run/FIND-02-missing-csp.png`](../evidence/screenshots/findings%20run/FIND-02-missing-csp.png)
  - Log headers đã làm sạch: [`../evidence/logs/RUN-01-headers-sample.txt`](../evidence/logs/RUN-01-headers-sample.txt)
- **Giới hạn:** Header CSP hiện có trên bản `v8.8.0` vẫn cho phép `'unsafe-inline'` và `'unsafe-eval'` nên chưa đạt mức phòng thủ XSS tối ưu.

---

### FIND-03 — Lỗi xử lý ngoại lệ HTTP 500 trên `POST /livewire/update` khi nhận chuỗi dài (ZAP gắn nhãn Buffer Overflow)

- **Test case liên quan:** `TC_DAST_04` (Xử lý dữ liệu đầu vào)
- **Nguồn/cảnh báo:** OWASP ZAP Active Scan — Alert: *Buffer Overflow* (`POST http://localhost:8000/livewire/update`, tham số `method`).
- **Điều kiện và bước tái hiện:**
  1. Gửi yêu cầu `POST` tới endpoint `/livewire/update` với payload JSON chứa trường `method` có độ dài khoảng 2.500 ký tự bất thường.
  2. Quan sát mã trạng thái HTTP và trạng thái kết nối trả về từ server.
- **Kết quả kỳ vọng/thực tế:**
  - *Kỳ vọng:* Ứng dụng kiểm tra tính hợp lệ của tên phương thức Livewire và trả về mã lỗi phía client (`400 Bad Request` hoặc `422 Unprocessable Entity`).
  - *Thực tế:* Ứng dụng phát sinh ngoại lệ không được xử lý gọn, trả về mã `500 Internal Server Error` hoặc ngắt kết nối, khiến bộ quét ZAP gắn nhãn cảnh báo *Buffer Overflow*.
- **Severity và căn cứ:** **Medium** (theo nhãn của ZAP; xét trên thực tế kỹ thuật, đây là điểm yếu xử lý đầu vào mức **Low/Informational** gây lỗi 500, không phải lỗ hổng tràn bộ đệm bộ nhớ).
- **Trạng thái:** **False positive** (đối với phân loại *Buffer Overflow* của scanner) / **Đã xác minh** (hành vi trả về HTTP 500 khi nhận input quá dài).
- **Nguyên nhân gốc:**
  - *Đã xác nhận:* Snipe-IT chạy trên runtime PHP `8.3.6` (ngôn ngữ có cơ chế quản lý bộ nhớ tự động), do đó không tồn tại lỗi tràn bộ đệm cấp phát bộ nhớ như C/C++. Cảnh báo của ZAP là nhận diện heuristic dựa trên dấu hiệu server trả về lỗi `500` và ngắt kết nối khi gửi chuỗi dài ~2.500 ký tự.
- **Evidence:**
  - Báo cáo quét: [`../reports/RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html)
  - Ảnh minh chứng phản hồi HTTP 500: [`../evidence/screenshots/findings%20run/FIND-03-livewire-500.png`](../evidence/screenshots/findings%20run/FIND-03-livewire-500.png)
- **Giới hạn:** Chưa kiểm tra log chi tiết phía container `app` (`storage/logs/laravel.log`) để xác định chính xác lớp ngoại lệ PHP phát sinh tại `/livewire/update`.

---

### FIND-04 — Đóng gói thư viện JavaScript lỗi thời (Bootstrap `3.3.4` trong `/js/dist/all.js`)

- **Test case liên quan:** `TC_DAST_06` (Phát hiện tự động của ZAP)
- **Nguồn/cảnh báo:** OWASP ZAP Passive Scan — Alert: *Vulnerable JS Library* (`http://localhost:8000/js/dist/all.js`).
- **Điều kiện và bước tái hiện:**
  1. Tải tệp tài nguyên tĩnh `/js/dist/all.js` từ ứng dụng Snipe-IT `v8.8.0`.
  2. Kiểm tra thông tin phiên bản thư viện Bootstrap được đóng gói bên trong tệp bundle.
- **Kết quả kỳ vọng/thực tế:**
  - *Kỳ vọng:* Các thư viện JavaScript phía client được cập nhật lên phiên bản đã vá các lỗ hổng bảo mật đã công bố.
  - *Thực tế:* Tệp `/js/dist/all.js` đóng gói thư viện **Bootstrap 3.3.4**, phiên bản nằm trong phạm vi ảnh hưởng của nhiều lỗ hổng XSS đã công bố (như `CVE-2019-8331`, `CVE-2024-6485`).
- **Severity và căn cứ:** **Medium** (theo phân loại của OWASP ZAP dựa trên cơ sở dữ liệu CVE của thư viện phía client).
- **Trạng thái:** **Đã xác minh** (về mặt sự tồn tại của phiên bản thư viện Bootstrap `3.3.4` trong bundle).
- **Nguyên nhân gốc:**
  - *Đã xác nhận:* Bản dựng phát hành `v8.8.0` của Snipe-IT vẫn duy trì nhánh giao diện AdminLTE/Bootstrap 3 cũ trong tệp biên dịch `/js/dist/all.js`.
- **Evidence:**
  - Báo cáo quét: [`../reports/RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html)
  - Ảnh minh chứng định danh phiên bản trong `all.js`: [`../evidence/screenshots/findings%20run/FIND-04-bootstrap-334.png`](../evidence/screenshots/findings%20run/FIND-04-bootstrap-334.png)
- **Giới hạn:** Mới xác nhận phiên bản thư viện tồn tại trong bundle; chưa chứng minh được luồng khai thác XSS thực tế qua các thuộc tính `data-target`, `href` hoặc tooltip/popover từ dữ liệu người dùng nhập vào trên Snipe-IT.

---

### FIND-05 — Thiếu Security Headers trên tài nguyên tĩnh và lộ phiên bản Web Server (`Apache/2.4.58`)

- **Test case liên quan:** `TC_DAST_05` (HTTP security headers/cookie)
- **Nguồn/cảnh báo:** OWASP ZAP Passive Scan — Alerts: *X-Content-Type-Options Header Missing*, *Strict-Transport-Security Header Not Set*, *Server Leaks Version Information via "Server" HTTP Response Header Field*.
- **Điều kiện và bước tái hiện:**
  1. Gửi yêu cầu HTTP `GET` tới các tệp tĩnh (`/js/dist/all.js`, `/css/dist/all.css`) và các trang trên `http://localhost:8000`.
  2. Quan sát các HTTP Response Headers trả về từ máy chủ web Apache trong container.
- **Kết quả kỳ vọng/thực tế:**
  - *Kỳ vọng:* Phản hồi có header `X-Content-Type-Options: nosniff`, header `Strict-Transport-Security` (khi triển khai HTTPS) và header `Server` được ẩn phiên bản chi tiết.
  - *Thực tế:* Các tệp tĩnh không có header `X-Content-Type-Options` và `Strict-Transport-Security`; đồng thời header `Server` trả về chuỗi chi tiết `Apache/2.4.58 (Ubuntu)`.
- **Severity và căn cứ:** **Low** (theo phân loại của OWASP ZAP; chủ yếu cung cấp thông tin nhận diện phần mềm máy chủ và thiếu tăng cường bảo vệ MIME-sniffing cho tài nguyên tĩnh).
- **Trạng thái:** **Đã xác minh**
- **Nguyên nhân gốc:**
  - *Đã xác nhận:* Cấu hình Apache mặc định trong image Docker của Snipe-IT chưa bật `ServerTokens Prod` / `ServerSignature Off` và chưa bổ sung header bảo mật cho các tệp tĩnh phục vụ trực tiếp không qua PHP middleware.
- **Evidence:**
  - Báo cáo quét: [`../reports/RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html)
  - Ảnh minh chứng response header của file tĩnh: [`../evidence/screenshots/findings%20run/FIND-05-server-headers.png`](../evidence/screenshots/findings%20run/FIND-05-server-headers.png)
  - Log headers đã làm sạch: [`../evidence/logs/RUN-01-headers-sample.txt`](../evidence/logs/RUN-01-headers-sample.txt)
- **Giới hạn:** Môi trường kiểm thử hiện chạy qua giao thức HTTP (`http://localhost:8000`), do đó header `Strict-Transport-Security` (HSTS) theo đặc tả trình duyệt chỉ có tác dụng khi ứng dụng được cấu hình chạy qua HTTPS.

---

### FIND-06 — Cookie `XSRF-TOKEN` không thiết lập cờ `HttpOnly`

- **Test case liên quan:** `TC_DAST_05` (HTTP security headers/cookie)
- **Nguồn/cảnh báo:** OWASP ZAP Passive Scan — Alert: *Cookie No HttpOnly Flag* (Cookie: `XSRF-TOKEN`).
- **Điều kiện và bước tái hiện:**
  1. Truy cập `http://localhost:8000/login` và kiểm tra các header `Set-Cookie` trong phản hồi HTTP.
  2. Đối chiếu thuộc tính cờ bảo mật của hai cookie `XSRF-TOKEN` và `snipeit_session`.
- **Kết quả kỳ vọng/thực tế:**
  - *Kỳ vọng:* Cookie phiên đăng nhập phải có cờ `HttpOnly`, còn cookie chống CSRF phía client hoạt động đúng cơ chế bảo vệ của framework.
  - *Thực tế:* Cookie `XSRF-TOKEN` không đặt cờ `HttpOnly`, trong khi cookie phiên đăng nhập `snipeit_session` đã được thiết lập đầy đủ `HttpOnly` và `SameSite=Lax`.
- **Severity và căn cứ:** **Low** (theo phân loại tự động của ZAP).
- **Trạng thái:** **False positive**
- **Nguyên nhân gốc:**
  - *Đã xác nhận:* Snipe-IT được xây dựng trên framework Laravel. Theo kiến trúc chuẩn của Laravel, cookie `XSRF-TOKEN` **bắt buộc không đặt `HttpOnly`** để mã JavaScript hợp lệ (như Axios) có thể đọc giá trị token và gắn vào HTTP header `X-XSRF-TOKEN` trong các yêu cầu AJAX/API nhằm phòng chống tấn công CSRF. Cookie này không chứa thông tin định danh phiên đăng nhập.
- **Evidence:**
  - Báo cáo quét: [`../reports/RUN-01-20261016-zap-report.html`](../reports/RUN-01-20261016-zap-report.html)
  - Ảnh minh chứng `Set-Cookie` (đã che giá trị token): [`../evidence/screenshots/findings%20run/FIND-06-xsrf-cookie.png`](../evidence/screenshots/findings%20run/FIND-06-xsrf-cookie.png)
- **Giới hạn:** Không có; đã đối chiếu trực tiếp với cấu hình session và cơ chế CSRF của Laravel trên Snipe-IT `v8.8.0`.