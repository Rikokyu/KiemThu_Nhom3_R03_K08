# Test cases DAST

> Phụ trách rà soát và tổng hợp: Nguyễn Trung Hiệp
> Phân công từng nhóm case theo bảng phân công; chỉ cập nhật kết quả sau khi chạy thật và lưu evidence.

## Danh sách test case

| Nhóm | ID | Mục tiêu | Phạm vi chính | Phụ trách | Phối hợp | Status |
|---|---|---|---|---|---|---|
| Xác thực | `TC_AUTH_001` | Từ chối đăng nhập với mật khẩu sai | `/login` | Nguyễn Trung Hiệp | — | NOT RUN |
| Xác thực | `TC_AUTH_002` | Yêu cầu xác thực khi truy cập trang bảo vệ | `/assets`, `/users` | Nguyễn Trung Hiệp | — | NOT RUN |
| Xác thực | `TC_AUTH_003` | Kiểm tra cookie/session sau đăng nhập | `/login`, `/account` | Nguyễn Trung Hiệp | — | NOT RUN |
| Phân quyền | `TC_AUTHZ_001` | Kiểm tra quyền truy cập tài sản/trang quản trị | `/users`, `/assets` | Nguyễn Lê Anh Tuấn | Nguyễn Trung Hiệp | NOT RUN |
| Phân quyền | `TC_AUTHZ_002` | Kiểm tra quyền chỉnh sửa tài sản | `/hardware/{id}/edit` | Nguyễn Lê Anh Tuấn | Nguyễn Trung Hiệp | NOT RUN |
| Quản lý tài sản | `TC_ASSET_001` | Xem danh sách tài sản theo quyền | `/hardware` | Nguyễn Văn An | Ngô Văn Chương | NOT RUN |
| Quản lý tài sản | `TC_ASSET_002` | Validation khi nhập/sửa tài sản | `/hardware/create`, `/hardware/{id}/edit` | Nguyễn Văn An | Ngô Văn Chương | NOT RUN |
| API | `TC_API_001` | Từ chối truy cập API được bảo vệ khi chưa xác thực | Endpoint cần xác nhận trong scope | Đỗ Duy Biên | Nguyễn Văn An | NOT RUN |
| API | `TC_API_002` | Xử lý tham số API không hợp lệ | Endpoint cần xác nhận trong scope | Đỗ Duy Biên | Nguyễn Văn An | NOT RUN |
| Cookie | `TC_COOKIE_001` | Kiểm tra thuộc tính session/XSRF cookie | HTTP response headers | Nguyễn Trung Hiệp | — | NOT RUN |
| ZAP | `TC_ZAP_001` | Đánh giá HTTP security headers | Target local trong scope | Nguyễn Lê Anh Tuấn | — | NOT RUN |
| ZAP | `TC_ZAP_002` | Thu thập, phân loại và xác minh cảnh báo ZAP | Target/context local đã duyệt | Nguyễn Lê Anh Tuấn | — | NOT RUN |

Chi tiết precondition, input/steps và expected result nằm trong [`../test-cases/dast-test-cases.csv`](../test-cases/dast-test-cases.csv). Endpoint API cụ thể phải được xác định và ghi nhận trước khi chạy; không thay placeholder bằng route suy đoán.
Trong CSV, `Owner`/`Collaborator` ghi phân công; `Run By`/`Run Date` ghi nhận lần thực thi thực tế.

## Đối chiếu trạng thái với bảng theo dõi

Ảnh bảng phân công ghi các nhóm Xác thực, Phân quyền và ZAP là “Hoàn thành”. Đây là trạng thái tổng hợp của nhóm công việc, không cung cấp actual result/evidence riêng cho từng test case. Vì vậy các case trong tài liệu và CSV vẫn là `NOT RUN` cho đến khi thành viên điền kết quả thực tế, ngày chạy và liên kết evidence tương ứng.

Đầu việc “Thực hiện test case cookie và ZAP” trong bảng tiến độ giao Đỗ Duy Biên thực hiện, phối hợp Nguyễn Lê Anh Tuấn. Phân công đó là đầu việc thực thi; người phụ trách chính của các case theo bảng phân công test case vẫn được giữ riêng trong cột **Phụ trách**.

## Mẫu test case

### <ID> — <Tên ngắn>

- **Mục tiêu:**
- **Module/URL trong scope:**
- **Role/tài khoản thử nghiệm:** ghi định danh role, không ghi mật khẩu.
- **Precondition:**
- **Input/Steps:**
  1.
- **Expected result:**
- **Actual result:**
- **Status:** NOT RUN
- **Evidence:** liên kết tương đối dưới `reports/` hoặc `evidence/`.
- **Người chạy/Ngày chạy:**
- **Ghi chú/giới hạn:**

Status hợp lệ: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`. `FAIL` cần có actual result và evidence; cảnh báo tự động chưa xác minh không tự động đồng nghĩa với `FAIL`.
