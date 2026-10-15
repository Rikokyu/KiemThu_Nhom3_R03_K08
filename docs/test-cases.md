# Test cases DAST

> Phụ trách: Nguyễn Trung Hiệp  
> Chỉ cập nhật trạng thái sau khi chạy thật và lưu evidence.

## Danh sách test case

| ID | Mục tiêu | Module/URL trong scope | Role | Status | Evidence |
|---|---|---|---|---|---|
| DAST-01 | Truy cập khi chưa đăng nhập | | | NOT RUN | |
| DAST-02 | Phân quyền theo role | | | NOT RUN | |
| DAST-03 | Vòng đời session | | | NOT RUN | |
| DAST-04 | Xử lý dữ liệu đầu vào | | | NOT RUN | |
| DAST-05 | HTTP security headers/cookie | | | NOT RUN | |
| DAST-06 | Phát hiện tự động của ZAP | | | NOT RUN | |

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
- **Evidence:** liên kết tương đối dưới `reports/`.
- **Người chạy/Ngày chạy:**
- **Ghi chú/giới hạn:**

Status hợp lệ: `PASS`, `FAIL`, `BLOCKED`, `NOT RUN`. `FAIL` cần có actual result và evidence; cảnh báo tự động chưa xác minh không tự động đồng nghĩa với `FAIL`.
