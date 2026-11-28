
# Phương pháp thiết kế Test Case Playwright

## 1. Phạm vi

Tài liệu mô tả phương pháp thiết kế bộ kiểm thử tự động bằng Playwright cho hệ thống Snipe-IT.

Bộ kiểm thử gồm 29 Test Case nghiệp vụ thuộc 5 nhóm:

| Nhóm | Phạm vi |
|---|---|
| AUTH | Authentication – Xác thực |
| AUTHZ | Authorization – Phân quyền |
| ASSET | Asset Management – Quản lý tài sản |
| API | API Testing – Kiểm thử API |
| COOKIE | Cookie and Session Security – Bảo mật Cookie và Session |

Bộ Playwright này độc lập với bộ Test Case DAST/thủ công sử dụng mã `TC_*` trong `docs/test-cases.md`.

## 2. Kỹ thuật thiết kế kiểm thử

| Kỹ thuật | Cách áp dụng |
|---|---|
| Equivalence Partitioning | Phân chia dữ liệu đăng nhập, API và Asset thành các nhóm hợp lệ/không hợp lệ. |
| Boundary Value Analysis | Kiểm tra các giá trị biên của dữ liệu Asset, thời gian throttle và giới hạn đầu vào. |
| Decision Table | Kiểm tra tổ hợp trạng thái tài khoản, quyền cá nhân, quyền Group và quyền API. |
| Negative Testing | Kiểm tra truy cập chưa xác thực, ID không hợp lệ và request thiếu CSRF. |
| State Transition | Kiểm tra quá trình login/logout/session và vòng đời tạo, cập nhật, xóa Asset. |
| Risk-based Testing | Ưu tiên các trường hợp có rủi ro về phân quyền và truy cập xuyên Company. |
| Configuration Testing | Kiểm tra cấu hình Cookie, Session và các thuộc tính bảo mật. |

## 3. Kết quả thực thi gần nhất

Lượt chạy gần nhất được người dùng trực tiếp thực hiện bằng lệnh:

`npm run test:full`

Thông tin lượt chạy:

- RUN_ID: `20261127142336-FDB59D`
- Tổng số executions: 34
- PASS: 31
- FAIL: 1
- SKIPPED: 2
- Thời gian thực thi: khoảng 3 phút 12 giây.

**Lưu ý:** 34 executions bao gồm các bước kiểm tra và thực thi phụ trợ. Đây không phải 34 Test Case nghiệp vụ riêng biệt.

Ở cấp độ 29 mã Test Case nghiệp vụ, báo cáo tổng hợp ghi nhận:

- PASS: 26
- FAIL: 1
- SKIPPED: 2

Không cộng trực tiếp hai loại số liệu trên vì chúng phản ánh hai cấp thống kê khác nhau.

## 4. Các trường hợp chưa đạt hoặc chưa thực hiện

### ASSET-04 – warranty_months = 241

Ứng dụng chấp nhận giá trị `warranty_months=241`, trong khi assertion của Test Case kỳ vọng request bị từ chối bằng HTTP 422 hoặc JSON có `status: error`.

Trạng thái: FAIL.

Đây là kết quả quan sát được trong lượt chạy. Chưa tự kết luận nguyên nhân hoặc khẳng định giới hạn nghiệp vụ nếu chưa có đặc tả tương ứng.

### AUTHZ-06 – Cross-company asset access

Trạng thái: SKIPPED.

Nguyên nhân: môi trường chưa bật FMCS / Company Scoping, không đáp ứng điều kiện để thực hiện kiểm thử.

### COOKIE-04 – Cookie Secure over HTTPS

Trạng thái: SKIPPED.

Nguyên nhân: môi trường hiện tại sử dụng HTTP, chưa có HTTPS để xác minh thuộc tính Secure.

## 5. Nguyên tắc đánh giá kết quả

- PASS: Test Case thực hiện và đạt kết quả mong đợi.
- FAIL: Test Case thực hiện nhưng kết quả thực tế không khớp kỳ vọng.
- SKIPPED: Test Case không được thực hiện do điều kiện môi trường hoặc tiền điều kiện chưa đáp ứng.
- BLOCKED: Test Case bị ngăn cản và chưa thể hoàn tất do phụ thuộc hoặc trở ngại chưa được giải quyết.

Không chuyển đổi trạng thái để làm đẹp báo cáo. Mọi thay đổi kết quả phải có lượt kiểm thử mới và bằng chứng tương ứng.

## 6. Tài liệu liên quan

- [Báo cáo triển khai Test Case](TEST_CASE_IMPLEMENTATION_REPORT.md)
- [Báo cáo kiểm thử cuối cùng](FINAL_TEST_REPORT.md)
- [Yêu cầu dữ liệu kiểm thử](TEST_DATA_REQUIREMENTS.md)
- [Quản lý dữ liệu kiểm thử](TEST_DATA_MANAGEMENT.md)
