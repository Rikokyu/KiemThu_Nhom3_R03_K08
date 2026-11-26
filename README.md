# Đề tài môn Kiểm thử phần mềm: R03 – Snipe-IT kết hợp K08 – DAST

> **Đơn vị:** Trường Đại học Đà Lạt – Khoa Công nghệ Thông tin  
> **Học phần:** Kiểm thử phần mềm  
> **Giảng viên:** Nguyễn Thế Lâm  
> **Nhóm:** 5 thành viên  
> **Nhóm trưởng:** Nguyễn Trung Hiệp  
> **Trạng thái:** Kế hoạch thực hiện và phân công công việc; cập nhật kết quả sau khi kiểm chứng trên môi trường local.

---

## Mục lục

- [1. Giới thiệu đề tài](#1-giới-thiệu-đề-tài)
- [2. Mục tiêu và phạm vi](#2-mục-tiêu-và-phạm-vi)
- [3. Thông tin thành viên](#3-thông-tin-thành-viên)
- [4. Nguyên tắc phân công](#4-nguyên-tắc-phân-công)
- [5. Phân công chi tiết theo thành viên](#5-phân-công-chi-tiết-theo-thành-viên)
- [6. Bảng phân chia Test Case cho thành viên](#6-bảng-phân-chia-test-case-cho-thành-viên)
- [7. Quy trình làm việc của nhóm](#7-quy-trình-làm-việc-của-nhóm)
- [8. Quy ước Git và quản lý mã nguồn](#8-quy-ước-git-và-quản-lý-mã-nguồn)
- [9. Kế hoạch kiểm thử DAST](#9-kế-hoạch-kiểm-thử-dast)
- [10. Mẫu thiết kế test case](#10-mẫu-thiết-kế-test-case)
- [11. Deliverables và tiêu chí hoàn thành](#11-deliverables-và-tiêu-chí-hoàn-thành)
- [12. Các mốc tiến độ](#12-các-mốc-tiến-độ)
- [13. Thông tin môi trường cần ghi nhận](#13-thông-tin-môi-trường-cần-ghi-nhận)
- [14. Tài liệu tham khảo](#14-tài-liệu-tham-khảo)

---

## 1. Giới thiệu đề tài

Nhóm lựa chọn tổ hợp đề tài:

- **R03 – Snipe-IT:** hệ thống mã nguồn mở phục vụ quản lý tài sản CNTT.
- **K08 – DAST (Dynamic Application Security Testing):** kiểm thử bảo mật động, gửi các request tới ứng dụng đang chạy để tìm dấu hiệu lỗ hổng hoặc cấu hình bảo mật chưa phù hợp.
- **Công cụ DAST dự kiến:** OWASP ZAP, theo danh sách gợi ý trong tài liệu hướng dẫn môn học.
- **Kho mã nguồn tham khảo:** <https://github.com/grokability/snipe-it>

Nhóm đóng vai trò một **QA Team** tiếp nhận dự án mã nguồn mở. Công việc gồm hai phần bắt buộc: (1) phân tích hệ thống và thiết lập môi trường chạy; (2) lựa chọn phạm vi phù hợp, thiết kế kịch bản, thực thi DAST, thu thập bằng chứng và phân tích kết quả.

README này mô tả cách chia việc, phối hợp và các đầu ra dự kiến. Phân công là kế hoạch thực hiện; nhóm chỉ ghi nhận một kiểm thử là **PASS/FAIL** hoặc một phát hiện là **defect** sau khi đã chạy thử, lưu bằng chứng và xác minh.

### Tài liệu khởi chạy nhanh

- [Hướng dẫn cài Snipe-IT bằng Docker](docs/setup-docker.md)
- [Phiên bản, môi trường và tài khoản kiểm thử](docs/test-environment.md)
- [Khóa phiên bản kiểm thử](docs/version-lock.md)
- [12 test case theo báo cáo giữa kỳ](test-cases/dast-test-cases.csv)

## 2. Mục tiêu và phạm vi

### 2.1. Mục tiêu

1. Đọc hiểu cấu trúc mã nguồn, module và dependency quan trọng của Snipe-IT.
2. Dựng được ứng dụng trong môi trường **local** hoặc Docker; tài liệu hóa phiên bản, cấu hình, dữ liệu mẫu và các lệnh cần dùng.
3. Mô tả kiến trúc ở mức component/container và luồng dữ liệu của 3–5 nghiệp vụ trọng tâm.
4. Giải thích DAST, lý do chọn phạm vi, giả định, rủi ro và tiêu chí pass/fail.
5. Dùng OWASP ZAP để thực hiện kiểm thử động trên ứng dụng local, thu thập log/report, xác minh phát hiện và phân tích nguyên nhân.
6. Lưu mã nguồn, cấu hình, phiên bản repo và hướng dẫn để thành viên khác hoặc giảng viên có thể chạy lại.

### 2.2. Phạm vi kiểm thử đề xuất

Nhóm sẽ chốt phạm vi sau khi dựng ứng dụng và khảo sát các luồng thực tế. Phạm vi ban đầu ưu tiên:

- Đăng nhập, đăng xuất và quản lý session.
- Kiểm soát truy cập theo vai trò/quyền trên các trang hoặc API được chọn.
- Các form/đầu vào liên quan tới nghiệp vụ quản lý tài sản.
- Các cấu hình bảo mật HTTP/cookie có thể quan sát được từ ứng dụng đang chạy.
- Những endpoint và luồng liên quan trực tiếp tới các kịch bản trên.

Các luồng được chọn cuối cùng phải được ghi rõ trong báo cáo, kèm lý do chọn và điều kiện tiền đề. Không cần kiểm thử toàn bộ codebase nếu phạm vi đó quá lớn.

### 2.3. Giới hạn an toàn bắt buộc

- **Chỉ quét instance do nhóm dựng và được phép kiểm thử trên máy local/lab.** Không chạy active scan vào website Internet, máy chủ công khai hoặc hệ thống của bên thứ ba.
- Không đưa dữ liệu cá nhân/thông tin thật vào bộ dữ liệu kiểm thử; dùng tài khoản và dữ liệu giả lập.
- Trước active scan, tạo dữ liệu dùng thử và sao lưu/reset môi trường vì một số request có thể làm thay đổi dữ liệu.
- Giới hạn target và context trong OWASP ZAP; không quét domain ngoài phạm vi đã được nhóm phê duyệt.
- Bảo vệ thông tin đăng nhập, token, file `.env` và các bí mật cấu hình; không commit các thông tin này lên Git.

## 3. Thông tin thành viên

Danh sách thành viên và nhiệm vụ được cập nhật theo **bảng phân công công việc trong báo cáo giữa kỳ**.

| STT | MSSV | Họ và tên | Email | Vai trò |
|---:|---|---|---|---|
| 1 | 2312610 | Nguyễn Trung Hiệp | 2312610@dlu.edu.vn | **Nhóm trưởng**; xây dựng kế hoạch kiểm thử tổng thể, phụ trách kiểm thử xác thực và phân quyền, điều phối tiến độ và tổng hợp báo cáo |
| 2 | 2300003 | Nguyễn Lê Anh Tuấn | 2300003@dlu.edu.vn | Phụ trách cấu hình OWASP ZAP, thiết lập phạm vi quét, thu thập URL và thực hiện kiểm thử bảo mật |
| 3 | 2312565 | Nguyễn Văn An | 2312565@dlu.edu.vn | Phụ trách môi trường Docker, cơ sở dữ liệu, tài khoản và dữ liệu tài sản mẫu; hỗ trợ kiểm thử tài sản và API |
| 4 | 2312588 | Ngô Văn Chương | 2312588@dlu.edu.vn | Phân tích cấu trúc mã nguồn, kiến trúc, module, luồng nghiệp vụ và xác định URL/chức năng cần kiểm thử |
| 5 | 2312584 | Đỗ Duy Biên | 2312584@dlu.edu.vn | Thiết kế/rà soát test scenario, kiểm thử thủ công, xác minh cảnh báo và phân loại mức độ nghiêm trọng của lỗi |

> Thông tin MSSV và email được giữ theo README cũ. Họ tên thành viên được chuẩn hóa thành **Đỗ Duy Biên** theo cách ghi trong danh sách nhóm.


## 4. Nguyên tắc phân công

- Mỗi thành viên có **một mảng chính**, một đầu ra bàn giao cụ thể và phần phối hợp với các thành viên khác.
- Khối lượng được cân bằng theo chuỗi công việc: phân tích hệ thống → dựng môi trường → thiết kế test → chạy DAST → xác minh và báo cáo.
- Không thành viên nào chỉ làm việc hình thức. Mỗi người cần có commit/PR, tài liệu, bằng chứng kiểm thử hoặc phần trình bày thể hiện đóng góp thực tế.
- Nguyễn Trung Hiệp giữ vai trò điều phối/Git và chủ trì thiết kế test case; các thành viên còn lại cùng góp ý kịch bản, kiểm tra chéo và hỗ trợ chạy test.
- Các phần A–H trong cấu trúc báo cáo được gán người phụ trách chính tại Mục 6; cả nhóm vẫn chịu trách nhiệm đọc và rà soát báo cáo tổng thể.

### Tiêu chí peer review

Chấm chéo theo bốn tiêu chí, mỗi tiêu chí tối đa 2,5 điểm (tổng tối đa 10 điểm):

- **Đúng hạn:** nộp sản phẩm đúng deadline đã cam kết.
- **Chất lượng công việc:** sản phẩm chỉn chu, đúng yêu cầu, hạn chế phải sửa lại.
- **Thái độ và hợp tác:** tham gia họp, phản hồi và hỗ trợ các thành viên.
- **Sáng tạo và chủ động:** đóng góp ý tưởng và chủ động nhận việc.

## 5. Phân công chi tiết theo thành viên

Nội dung dưới đây được cập nhật theo phần **phân công công việc** trong báo cáo giữa kỳ. Phạm vi nhiệm vụ và sản phẩm bàn giao không tự ý mở rộng ngoài nội dung báo cáo.

### 5.1. Nguyễn Trung Hiệp — Nhóm trưởng, kế hoạch kiểm thử và xác thực/phân quyền

**Phụ trách chính**

1. Xây dựng kế hoạch kiểm thử tổng thể cho đề tài.
2. Phụ trách các trường hợp kiểm thử thuộc nhóm xác thực (`TC_AUTH`).
3. Theo dõi và rà soát nhóm phân quyền (`TC_AUTHZ`); theo bảng phân công test case, Nguyễn Lê Anh Tuấn là người phụ trách chính và Nguyễn Trung Hiệp phối hợp.
4. Điều phối tiến độ thực hiện công việc của các thành viên.
5. Rà soát test case và tổng hợp nội dung báo cáo.

**Đầu ra cần bàn giao**

- Kế hoạch kiểm thử tổng thể.
- Các test case nhóm `TC_AUTH_*`; rà soát/điều phối nhóm `TC_AUTHZ_*`.
- Bảng theo dõi tiến độ.
- Nội dung báo cáo tổng hợp.

**Phối hợp**

- Với Nguyễn Lê Anh Tuấn trong nhóm test case phân quyền.
- Với Đỗ Duy Biên trong việc thực hiện test case cookie theo bảng tiến độ.
- Rà soát test case và tổng hợp tiến độ cùng các thành viên phụ trách.

### 5.2. Nguyễn Lê Anh Tuấn — Cấu hình OWASP ZAP và thực hiện DAST

**Phụ trách chính**

1. Cấu hình công cụ OWASP ZAP phục vụ kiểm thử bảo mật.
2. Thiết lập phạm vi quét phù hợp với hệ thống được phép kiểm thử.
3. Thu thập các URL thuộc phạm vi kiểm thử.
4. Thực hiện quét bảo mật trong phạm vi đã xác định.
5. Tổng hợp các cảnh báo được phát hiện từ công cụ.

**Đầu ra cần bàn giao**

- Cấu hình quét OWASP ZAP.
- Báo cáo kết quả quét.
- Các test case nhóm `TC_ZAP_*`.
- Bằng chứng quét.
- Danh sách cảnh báo cần xác minh.

**Phối hợp**

- Với Đỗ Duy Biên trong nhóm test case quét bảo mật bằng ZAP.
- Với Ngô Văn Chương trong việc xác định URL/chức năng và phạm vi quét.

### 5.3. Nguyễn Văn An — Môi trường, dữ liệu kiểm thử, tài sản và API

**Phụ trách chính**

1. Chuẩn bị và kiểm tra môi trường Docker.
2. Chuẩn bị và kiểm tra cơ sở dữ liệu.
3. Chuẩn bị tài khoản phục vụ kiểm thử.
4. Chuẩn bị dữ liệu tài sản mẫu.
5. Hỗ trợ kiểm thử chức năng quản lý tài sản.
6. Phối hợp kiểm thử các chức năng/API thuộc phạm vi.

**Đầu ra cần bàn giao**

- Tài liệu môi trường.
- Hướng dẫn khởi chạy hệ thống.
- Dữ liệu kiểm thử.
- Kết quả các test case nhóm `TC_ASSET_*`.
- Kết quả phối hợp thực hiện nhóm `TC_API_*`.

**Phối hợp**

- Với Ngô Văn Chương trong nhóm test case quản lý tài sản.
- Với Đỗ Duy Biên trong nhóm test case API.

### 5.4. Ngô Văn Chương — Phân tích hệ thống và xác minh/kiểm thử lại

**Phụ trách chính**

1. Phân tích cấu trúc mã nguồn Snipe-IT.
2. Phân tích kiến trúc và các module của hệ thống.
3. Phân tích các luồng nghiệp vụ liên quan.
4. Xác định các URL và chức năng thuộc phạm vi kiểm thử.
5. Phối hợp xác định phạm vi quét.
6. Phối hợp xác minh và kiểm thử lại các trường hợp có kết quả bất thường theo phân công test case.

**Đầu ra cần bàn giao**

- Tài liệu phân tích hệ thống.
- Danh sách chức năng và URL thuộc phạm vi kiểm thử.
- Sơ đồ luồng nghiệp vụ liên quan.
- Kết quả xác minh/kiểm thử lại theo phần việc được giao.

**Phối hợp**

- Với Nguyễn Trung Hiệp trong nhóm test case xác thực và phân quyền theo bảng tiến độ.
- Với Nguyễn Văn An trong nhóm test case quản lý tài sản.
- Với Nguyễn Lê Anh Tuấn trong việc xác định URL và phạm vi quét.
- Với người phụ trách test case tương ứng khi cần xác minh kết quả bất thường.

### 5.5. Đỗ Duy Biên — Thiết kế scenario, kiểm thử thủ công và phân loại lỗi

**Phụ trách chính**

1. Thiết kế và rà soát các test scenario.
2. Thực hiện kiểm thử thủ công.
3. Đối chiếu kết quả mong đợi với kết quả thực tế.
4. Xác minh các cảnh báo được ghi nhận trong quá trình kiểm thử.
5. Phân loại mức độ nghiêm trọng của lỗi.

**Đầu ra cần bàn giao**

- Danh sách kịch bản kiểm thử.
- Kết quả thực hiện kiểm thử.
- Bằng chứng xác minh.
- Bảng phân loại lỗi.
- Đề xuất hướng xử lý.
- Kết quả thực hiện nhóm `TC_API_*` theo bảng phân công test case.

**Phối hợp**

- Với Nguyễn Trung Hiệp trong nhóm test case bảo mật cookie.
- Với Nguyễn Lê Anh Tuấn trong nhóm test case quét bảo mật bằng ZAP.
- Với các thành viên phụ trách test case tương ứng khi đối chiếu kết quả và xác minh cảnh báo.


## 6. Bảng phân chia Test Case cho thành viên

Bảng dưới đây giữ nguyên mã test case, người phụ trách chính và người phối hợp theo **Bảng 13 – Bảng phân chia Test Case cho thành viên** trong báo cáo giữa kỳ.

| Nhóm test case | Mã test case | Người phụ trách chính | Người phối hợp |
|---|---|---|---|
| Xác thực | `TC_AUTH_001`, `TC_AUTH_002`, `TC_AUTH_003` | Nguyễn Trung Hiệp | — |
| Phân quyền | `TC_AUTHZ_001`, `TC_AUTHZ_002` | Nguyễn Lê Anh Tuấn | Nguyễn Trung Hiệp |
| Quản lý tài sản | `TC_ASSET_001`, `TC_ASSET_002` | Nguyễn Văn An | Ngô Văn Chương |
| API | `TC_API_001`, `TC_API_002` | Đỗ Duy Biên | Nguyễn Văn An |
| Bảo mật cookie | `TC_COOKIE_001` | Nguyễn Trung Hiệp | — |
| Quét bảo mật bằng ZAP | `TC_ZAP_001`, `TC_ZAP_002` | Nguyễn Lê Anh Tuấn | — |
| Xác minh và phân loại lỗi | Các test case có kết quả bất thường | Ngô Văn Chương | Người phụ trách test case tương ứng |

> Bảng này phản ánh người phụ trách test case theo sheet phân công. Bảng tiến độ có thể giao người thực hiện một đầu việc tổng hợp khác; hai vai trò đó không thay thế nhau.
> Ở mức vai trò nhóm trưởng, sheet tổng quan cũng giao Nguyễn Trung Hiệp theo dõi `TC_AUTHZ`; bảng phân công case chi tiết ở trên xác định Nguyễn Lê Anh Tuấn là người phụ trách chính.

### Nguyên tắc thực hiện

- Người phụ trách chính chịu trách nhiệm thực hiện và cập nhật kết quả của nhóm test case được giao.
- Người phối hợp hỗ trợ chuẩn bị điều kiện kiểm thử, rà soát thao tác hoặc đối chiếu kết quả.
- Với test case có kết quả bất thường, Ngô Văn Chương phối hợp cùng người phụ trách test case tương ứng để xác minh và kiểm thử lại.
- Đỗ Duy Biên thực hiện xác minh cảnh báo và phân loại mức độ nghiêm trọng theo nhiệm vụ được giao.
- Chỉ cập nhật kết quả sau khi đã thực hiện kiểm thử; cần lưu lại bằng chứng tương ứng.


## 7. Quy trình làm việc của nhóm

### Bước 1 — Chuẩn bị môi trường và dữ liệu

- Nguyễn Văn An chuẩn bị/kiểm tra Docker, cơ sở dữ liệu, tài khoản và dữ liệu tài sản mẫu.
- Các thành viên thống nhất môi trường và điều kiện cần thiết để thực hiện các test case.

### Bước 2 — Phân tích hệ thống và xác định phạm vi

- Ngô Văn Chương phân tích cấu trúc mã nguồn, kiến trúc, module và luồng nghiệp vụ.
- Ngô Văn Chương xác định URL/chức năng cần kiểm thử và phối hợp xác định phạm vi quét.
- Nguyễn Lê Anh Tuấn sử dụng thông tin phạm vi để thiết lập OWASP ZAP.

### Bước 3 — Lập kế hoạch và rà soát test case

- Nguyễn Trung Hiệp xây dựng kế hoạch kiểm thử tổng thể, điều phối tiến độ và rà soát test case.
- Các test case được phân chia theo bảng tại Mục 6.
- Đỗ Duy Biên thiết kế/rà soát test scenario và chuẩn bị kiểm thử thủ công.

### Bước 4 — Thực hiện kiểm thử

- Nguyễn Trung Hiệp phụ trách nhóm `TC_AUTH`; Nguyễn Lê Anh Tuấn phụ trách `TC_AUTHZ`, Nguyễn Trung Hiệp phối hợp.
- Nguyễn Văn An phụ trách nhóm `TC_ASSET`, Ngô Văn Chương phối hợp.
- Đỗ Duy Biên phụ trách nhóm `TC_API`, Nguyễn Văn An phối hợp.
- Nguyễn Trung Hiệp phụ trách `TC_COOKIE_001`; đầu việc thực hiện cookie/ZAP trong bảng tiến độ do Đỗ Duy Biên phụ trách, phối hợp Nguyễn Lê Anh Tuấn.
- Nguyễn Lê Anh Tuấn phụ trách `TC_ZAP_001`, `TC_ZAP_002` và cấu hình/phạm vi quét; Đỗ Duy Biên thực hiện đầu việc test cookie/ZAP theo bảng tiến độ.
- Nguyễn Lê Anh Tuấn cấu hình ZAP, thiết lập phạm vi, thu thập URL và thực hiện quét trong phạm vi cho phép.

### Bước 5 — Đối chiếu, xác minh và phân loại

- Đỗ Duy Biên đối chiếu kết quả mong đợi với kết quả thực tế, xác minh cảnh báo và phân loại mức độ nghiêm trọng.
- Ngô Văn Chương phối hợp xác minh/kiểm thử lại các test case có kết quả bất thường cùng người phụ trách tương ứng.
- Các thành viên cập nhật kết quả và bằng chứng cho phần việc mình phụ trách.

### Bước 6 — Tổng hợp báo cáo

- Nguyễn Trung Hiệp điều phối tiến độ, rà soát test case và tổng hợp nội dung báo cáo.
- Các thành viên bàn giao tài liệu, kết quả và bằng chứng thuộc nhiệm vụ được giao.
- Cả nhóm rà soát tính thống nhất giữa test case, kết quả thực hiện và nội dung báo cáo.

### Trạng thái task đề xuất

`Backlog` → `To Do` → `In Progress` → `Review` → `Done`

Một task chỉ được chuyển sang **Done** khi phần việc đã được thực hiện, có đầu ra/bằng chứng phù hợp và được rà soát.


## 8. Quy ước Git và quản lý mã nguồn

### 8.1. Cấu trúc nhánh đề xuất

- `main`: phiên bản ổn định để nộp/demo.
- `feature/<task-id>-<short-name>`: tính năng/tài liệu/test mới.
- `docs/<task-id>-<short-name>`: cập nhật tài liệu.
- `test/<task-id>-<short-name>`: test case hoặc script kiểm thử.
- `fix/<task-id>-<short-name>`: sửa lỗi trong script/tài liệu.

Ví dụ: `docs/T01-system-analysis`, `test/T05-dast-cases`, `feature/T07-zap-runner`.

### 8.2. Quy tắc commit và pull request

- Commit cần mô tả được thay đổi; ví dụ: `docs: add Snipe-IT system architecture` hoặc `test: add DAST access-control cases`.
- Mỗi thành viên commit phần việc do mình thực hiện để lịch sử đóng góp dễ đối chiếu.
- Không đẩy thẳng thay đổi chưa review vào `main`; tạo Pull Request và nhờ ít nhất một thành viên khác rà soát.
- Khi review cần kiểm tra: đúng phạm vi, không chứa bí mật, hướng dẫn chạy có thể làm lại, report đã loại bỏ cookie/token/mật khẩu và dữ liệu nhạy cảm.
- Không commit file `.env`, credential, token, cookie/session, dữ liệu cá nhân hoặc file dump có thông tin nhạy cảm. Có thể cung cấp `.env.example` chỉ gồm tên biến và giá trị mẫu không nhạy cảm.
- Ghi commit SHA/tag Snipe-IT và phiên bản cấu hình test trong `docs/version-lock.md` để người khác chạy đúng phiên bản.

### 8.3. Gợi ý cấu trúc thư mục repository nhóm

Cấu trúc dưới đây đã được khởi tạo cho tài liệu và artefact của nhóm:

```text
.
├── README.md
├── docs/
│   ├── system-analysis.md
│   ├── architecture.md
│   ├── setup-local.md
│   ├── setup-docker.md
│   ├── C-environment-setup.md
│   ├── version-lock.md
│   ├── dast-runbook.md
│   ├── test-cases.md
│   ├── findings.md
│   └── integration-guide.md
├── test-cases/
│   ├── dast-test-cases.csv
│   └── dast-checklist.md
├── dast/
│   ├── config/
│   │   └── README.md    # Quy tắc lưu cấu hình ZAP an toàn
│   └── scripts/
│       └── README.md    # Quy ước lệnh/script chạy DAST
├── evidence/
│   ├── screenshots/
│   │   └── README.md
│   └── logs/
│       └── README.md
├── reports/
│   └── README.md        # Cách tổ chức và đọc báo cáo
└── presentation/
    └── README.md        # Ghi chú chuẩn bị slide/demo
```

Không nhất thiết phải đưa toàn bộ repository Snipe-IT vào thư mục con này. Nhóm cần phân biệt rõ mã nguồn upstream với repository chứa tài liệu, cấu hình và artefact kiểm thử của nhóm.
Các tài liệu A–E trong cấu trúc đề xuất ở ảnh được tổ chức tương ứng trong `docs/`: phân tích hệ thống (`system-analysis.md`), kiến trúc (`architecture.md`), thiết lập môi trường (`setup-local.md`/`setup-docker.md`), phương pháp DAST (`dast-runbook.md`) và thiết kế test (`test-cases.md`). Danh sách dạng CSV và checklist thao tác nằm trong `test-cases/`.

### 8.4. Hướng dẫn thực hiện đầu việc tích hợp

Đầu việc **“Tích hợp artefact kiểm thử, lệnh chạy và README nhóm”** do Nguyễn Trung Hiệp phụ trách chính (10/11/2026–20/11/2026). Cách chia artefact, checklist chạy lại trên máy mới, quy trình cập nhật lệnh đã kiểm chứng và tiêu chí review được ghi tại [`docs/integration-guide.md`](docs/integration-guide.md). Không ghi credential/token vào README, file cấu hình, log hoặc report.

Các tài liệu để dựng và chạy lại:

- [Khóa phiên bản và môi trường](docs/version-lock.md)
- [Thiết lập local](docs/setup-local.md) / [Thiết lập Docker](docs/setup-docker.md) — nhóm điền và duy trì cách thực sự hỗ trợ.
- [Test cases](docs/test-cases.md), [CSV](test-cases/dast-test-cases.csv), [checklist](test-cases/dast-checklist.md) và [runbook DAST](docs/dast-runbook.md)
- [Kết quả/phát hiện](docs/findings.md), [quy tắc report](reports/README.md) và [evidence](evidence/)

## 9. Kế hoạch kiểm thử DAST

### 9.1. Công cụ và cách tiếp cận

- **Công cụ dự kiến:** OWASP ZAP.
- **Phương pháp:** khảo sát ứng dụng đang chạy, cấu hình scope, thực hiện passive scan, sau khi review mới thực hiện active scan trong môi trường local, sau đó xác minh cảnh báo.
- **Phạm vi target:** ghi URL local thực tế khi nhóm đã dựng thành công, ví dụ `http://localhost:<PORT>`; thay `<PORT>` bằng port đã xác nhận.
- **Xác thực:** nếu kịch bản cần đăng nhập, chuẩn bị tài khoản thử nghiệm riêng cho từng role và kiểm tra ZAP đã duy trì session đúng cách.
- **Đầu ra:** cấu hình đã làm sạch bí mật, log, report, danh sách cảnh báo, kết quả xác minh và giới hạn của lần quét.

### 9.2. Nhóm test case theo phân công

Các nhóm dưới đây theo mã test case trong bảng phân công; việc liệt kê không phải tuyên bố rằng Snipe-IT đang có lỗi.

| Nhóm | Mã test case | Phạm vi |
|---|---|---|
| Xác thực | `TC_AUTH_001`–`TC_AUTH_003` | Đăng nhập sai, truy cập khi chưa đăng nhập và kiểm tra session/cookie |
| Phân quyền | `TC_AUTHZ_001`–`TC_AUTHZ_002` | Quyền xem và chỉnh sửa tài sản theo role |
| Quản lý tài sản | `TC_ASSET_001`–`TC_ASSET_002` | Xem danh sách tài sản và validation dữ liệu |
| API | `TC_API_001`–`TC_API_002` | API chưa xác thực và xử lý tham số không hợp lệ; endpoint cụ thể phải được xác nhận trước khi chạy |
| Cookie | `TC_COOKIE_001` | Quan sát thuộc tính cookie theo cấu hình local |
| DAST/ZAP | `TC_ZAP_001`–`TC_ZAP_002` | HTTP security headers và cảnh báo trong scope local |

Chi tiết bước chạy, expected result và phân công xem [`docs/test-cases.md`](docs/test-cases.md) và [`test-cases/dast-test-cases.csv`](test-cases/dast-test-cases.csv). Trạng thái nhóm trong bảng theo dõi không tự động thay thế actual result/evidence của từng case; chỉ cập nhật trạng thái case sau khi đối chiếu bằng chứng.

### 9.3. Tiêu chí đánh giá

- **PASS:** hành vi thực tế đáp ứng expected result đã định nghĩa và có bằng chứng.
- **FAIL:** hành vi thực tế trái với expected result, đã tái hiện và lưu bằng chứng.
- **BLOCKED:** chưa thực hiện được do môi trường, tài khoản, cấu hình hoặc phụ thuộc khác; phải ghi rõ lý do.
- **NOT RUN:** chưa chạy; không tính là PASS.
- **Finding cần xác minh:** cảnh báo của công cụ cần bước tái hiện/đối chiếu trước khi kết luận.
- Với phát hiện bảo mật, ghi nhận điều kiện khai thác, tác động có thể có và mức độ nghiêm trọng theo tiêu chí nhóm thống nhất; không khẳng định vượt quá bằng chứng.
- Nếu không phát hiện lỗi đã xác minh, báo cáo vẫn phải nêu rõ target, phạm vi, cấu hình, số lượng test đã chạy, log/report và các giới hạn; kết quả không chứng minh hệ thống an toàn tuyệt đối.

## 10. Mẫu thiết kế test case

Nguyễn Trung Hiệp chủ trì quản lý file `docs/test-cases.md`. Mỗi test case nên có tối thiểu các trường sau:

| Trường | Nội dung cần ghi |
|---|---|
| Test Case ID | Mã duy nhất theo bảng phân công, ví dụ `TC_AUTH_002` |
| Mục tiêu | Hành vi hoặc rủi ro cần kiểm tra |
| Module/URL | Module, route hoặc endpoint nằm trong scope |
| Mức quyền/tài khoản | Chưa đăng nhập hoặc role dùng để chạy test; không lưu mật khẩu thật |
| Precondition | Trạng thái hệ thống, dữ liệu và session trước khi chạy |
| Input/Steps | Dữ liệu thử và các bước tái hiện |
| Expected Result | Hành vi đúng được xác định trước khi chạy |
| Actual Result | Kết quả quan sát thực tế |
| Status | PASS / FAIL / BLOCKED / NOT RUN |
| Evidence | Link tới report, log hoặc ảnh chụp đã làm sạch dữ liệu nhạy cảm |
| Người chạy/Ngày chạy | Người thực hiện và ngày kiểm thử |
| Ghi chú | Hạn chế, cảnh báo chưa xác minh, điều kiện chạy lại |

### Ví dụ khung ghi test case

```markdown
### TC_AUTH_002 — Kiểm tra route cần xác thực khi chưa đăng nhập
- Mục tiêu:
- Module/URL trong scope:
- Precondition:
- Input/Steps:
  1. Xóa session/cookie test.
  2. Truy cập route đã xác nhận là cần đăng nhập trên instance local.
- Expected Result:
- Actual Result:
- Status: NOT RUN
- Evidence:
- Người chạy/Ngày chạy:
- Ghi chú:
```

> Không điền trước kết quả PASS/FAIL. Trạng thái chỉ được cập nhật sau khi chạy test và lưu bằng chứng.

## 11. Deliverables và tiêu chí hoàn thành

| Thành viên | Sản phẩm bàn giao | Tiêu chí hoàn thành |
|---|---|---|
| Nguyễn Trung Hiệp | Kế hoạch kiểm thử; test case `TC_AUTH_*`; rà soát/điều phối `TC_AUTHZ_*`; bảng theo dõi tiến độ; báo cáo tổng hợp | Có kế hoạch kiểm thử, kết quả các test case được giao, tiến độ được cập nhật và nội dung báo cáo được tổng hợp |
| Nguyễn Lê Anh Tuấn | Cấu hình quét; báo cáo OWASP ZAP; test case `TC_ZAP_*`; bằng chứng quét; danh sách cảnh báo | ZAP được cấu hình theo phạm vi cho phép; có báo cáo/bằng chứng và danh sách cảnh báo cần xem xét |
| Nguyễn Văn An | Tài liệu môi trường; hướng dẫn khởi chạy; dữ liệu kiểm thử; kết quả `TC_ASSET_*`; phối hợp `TC_API_*` | Môi trường, cơ sở dữ liệu, tài khoản và dữ liệu mẫu được chuẩn bị; có tài liệu và kết quả kiểm thử phần việc được giao |
| Ngô Văn Chương | Tài liệu phân tích hệ thống; danh sách chức năng/URL; sơ đồ luồng nghiệp vụ; kết quả xác minh/kiểm thử lại | Có tài liệu phân tích, xác định được URL/chức năng thuộc phạm vi và phối hợp xác minh các kết quả bất thường |
| Đỗ Duy Biên | Danh sách scenario; kết quả `TC_API_*`; kiểm thử thủ công; bằng chứng xác minh; bảng phân loại lỗi; đề xuất xử lý | Có scenario, kết quả đối chiếu expected/actual, bằng chứng và phân loại mức độ nghiêm trọng của lỗi |

### Checklist trước khi nộp

- [ ] Có kế hoạch kiểm thử tổng thể.
- [ ] Có bảng phân công thành viên và bảng phân chia test case.
- [ ] Có tài liệu phân tích hệ thống, danh sách chức năng/URL và sơ đồ luồng nghiệp vụ.
- [ ] Có tài liệu môi trường, hướng dẫn khởi chạy và dữ liệu kiểm thử.
- [ ] Có cấu hình, báo cáo và bằng chứng quét OWASP ZAP.
- [ ] Có kết quả thực hiện test case và bằng chứng tương ứng.
- [ ] Các cảnh báo/kết quả bất thường đã được xem xét, xác minh hoặc ghi rõ trạng thái chưa xác minh.
- [ ] Có bảng phân loại lỗi và đề xuất hướng xử lý.
- [ ] Không đưa credential, cookie, token hoặc dữ liệu nhạy cảm vào repository.


## 12. Các mốc tiến độ

Các mốc dưới đây được trích theo hướng dẫn môn học; nhóm cần theo dõi thông báo của giảng viên/nhà trường nếu lịch thực tế có điều chỉnh.

| Mốc | Yêu cầu theo hướng dẫn | Việc nhóm cần chuẩn bị |
|---|---|---|
| **18/09 — Hạn đăng ký đề tài** | Chốt thành viên, repo, kỹ thuật; chốt commit SHA/tag; thiết lập công cụ quản lý dự án | Xác nhận danh sách nhóm, lựa chọn R03 + K08, repo và task board; ghi phiên bản upstream |
| **20/10 — Báo cáo giữa kỳ** | Demo hệ thống chạy thành công; trình bày sơ đồ kiến trúc, tài liệu onboarding và kế hoạch kỹ thuật kiểm thử | Ưu tiên hoàn thành phần A–C, sơ đồ kiến trúc, tài liệu setup, phạm vi DAST, giả định/rủi ro và tiêu chí đánh giá |
| **Bảo vệ cuối kỳ theo lịch nhà trường** | Thuyết trình toàn bộ dự án, demo script automation, nộp mã nguồn test và báo cáo tổng kết; báo cáo nộp trước buổi bảo vệ 1 tuần theo hướng dẫn | Hoàn thiện phần D–H, script/test cases, report/log, phân tích nguyên nhân, hướng dẫn chạy lại, slide và demo rehearsal |

### Ưu tiên công việc theo giai đoạn

1. **Trước giữa kỳ:** dựng hệ thống thành công, khóa phiên bản, hoàn tất sơ đồ kiến trúc/onboarding, chọn scope và viết kế hoạch DAST.
2. **Sau giữa kỳ:** hoàn thiện test case, cấu hình ZAP, chạy kiểm thử local, xác minh cảnh báo và tổng hợp log/report.
3. **Trước nộp cuối kỳ:** rà soát A–H, kiểm tra tái lập từ môi trường sạch, dọn bí mật khỏi repo, peer-review và tập demo.

## 13. Thông tin môi trường cần ghi nhận

Các thông tin môi trường đã kiểm chứng được cập nhật theo hướng dẫn Docker và báo cáo giữa kỳ.

| Thông tin | Giá trị cần cập nhật | Người cập nhật |
|---|---|---|
| Repository nhóm | `https://github.com/Rikokyu/KiemThu_Nhom3_R03_K08` | Nguyễn Trung Hiệp |
| Repository upstream | `https://github.com/grokability/snipe-it` | Nguyễn Trung Hiệp |
| Release/tag upstream | `v8.8.0` | Nguyễn Trung Hiệp + Nguyễn Văn An |
| Commit SHA upstream | `2c466fa8a5a68525439bf1bbbc24470d6670c516` | Nguyễn Trung Hiệp + Nguyễn Văn An |
| Hệ điều hành/môi trường | Windows 11 + Docker Desktop/WSL 2 | Nguyễn Văn An |
| Cách dựng | Docker Compose | Nguyễn Văn An |
| DB/service và phiên bản | MariaDB 11.4.7 | Nguyễn Văn An |
| Port/URL local | `http://localhost:8000` | Nguyễn Văn An + Ngô Văn Chương |
| Phiên bản OWASP ZAP | `<PHIÊN_BẢN_ĐÃ_DÙNG>` | Nguyễn Lê Anh Tuấn |
| Lệnh chạy DAST | `<LỆNH_ĐÃ_CHẠY_THÀNH_CÔNG>` | Nguyễn Lê Anh Tuấn |
| Vị trí report/evidence | `<ĐƯỜNG_DẪN_TRONG_REPO>` | Đỗ Duy Biên |

### Hướng dẫn chạy lại cần hoàn thiện

README cuối cùng của nhóm phải cung cấp các bước theo đúng thứ tự, dựa trên môi trường đã kiểm chứng:

1. Cài dependency và phiên bản công cụ yêu cầu.
2. Lấy đúng phiên bản/tag/commit của Snipe-IT.
3. Khai báo cấu hình môi trường từ mẫu; không chia sẻ giá trị bí mật.
4. Khởi động DB/service và ứng dụng; kiểm tra ứng dụng truy cập được bằng URL local.
5. Tạo/reset dữ liệu giả lập và tài khoản test.
6. Khởi chạy OWASP ZAP với target/scope đã xác nhận, theo hướng dẫn/script của nhóm.
7. Xuất report/log, chạy bước xác minh và cập nhật trạng thái test case.
8. Xóa hoặc che các session/token/thông tin nhạy cảm trước khi commit và nộp báo cáo.

## 14. Tài liệu tham khảo

1. **Hướng dẫn thực hiện đề tài môn Kiểm thử phần mềm**, giảng viên Nguyễn Thế Lâm, Trường Đại học Đà Lạt, đặc biệt các mục: nội dung đề tài, quy định nhóm, cấu trúc báo cáo A–H, milestones, quy trình làm việc và phụ lục R03/K08.
2. Repository Snipe-IT: <https://github.com/grokability/snipe-it>
3. OWASP ZAP documentation: <https://www.zaproxy.org/docs/>

---

**Nguyên tắc chốt:** README này là kế hoạch và checklist làm việc. Mọi thông tin về phiên bản, lệnh chạy, kết quả test và phát hiện bảo mật cần được cập nhật từ lần chạy thực tế của nhóm, kèm bằng chứng và người chịu trách nhiệm.
