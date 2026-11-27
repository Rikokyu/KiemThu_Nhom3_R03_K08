# Runbook kiểm thử DAST bằng OWASP ZAP

> Phụ trách: Nguyễn Lê Anh Tuấn

## 1. Tổng quan về DAST

DAST (Dynamic Application Security Testing) là kỹ thuật kiểm thử bảo mật ứng dụng khi hệ thống đang chạy. Công cụ quan sát các yêu cầu và phản hồi HTTP, mã trạng thái và dữ liệu trả về để nhận diện dấu hiệu cấu hình sai hoặc xử lý thiếu an toàn. Đây là cách tiếp cận hộp đen, dựa trên hành vi quan sát được từ giao diện web và API, không yêu cầu truy cập mã nguồn.

Quy trình gồm xác định các trang, biểu mẫu và API nằm trong phạm vi kiểm thử, thu thập lưu lượng phát sinh khi sử dụng ứng dụng, rồi phân tích phản hồi và ghi nhận cảnh báo. Quét thụ động phân tích lưu lượng đã được ghi nhận. Quét chủ động là một chế độ riêng có thể gửi thêm yêu cầu kiểm thử và ảnh hưởng đến dữ liệu hoặc tải của hệ thống.

### Ưu điểm và giới hạn

| Ưu điểm | Giới hạn |
|---|---|
| Phát hiện dấu hiệu lỗi xuất hiện khi ứng dụng đang chạy, như cấu hình sai, vấn đề xác thực và xử lý lỗi thiếu an toàn. | Cảnh báo có thể là dương tính giả. Công cụ cũng có thể bỏ sót lỗi phụ thuộc vào ngữ cảnh hoặc luồng nghiệp vụ cụ thể. |
| Phù hợp với nhiều ngôn ngữ và framework. | Phạm vi chủ yếu là ứng dụng web và API. Kết quả thường cần đối chiếu thêm để xác định vị trí lỗi trong mã nguồn. |
| Báo cáo chỉ ra URL bị ảnh hưởng và bằng chứng quan sát được, hỗ trợ ưu tiên khắc phục. | Các màn hình sau đăng nhập và luồng nhiều bước cần thao tác khám phá phù hợp. Phạm vi lớn làm tăng thời gian kiểm thử. |
| Có thể tích hợp vào quy trình CI/CD để kiểm tra lặp lại. | Việc thiết lập và cấu hình cần thời gian. Nếu chỉ chạy ở giai đoạn tiền sản xuất, lỗi có thể được phát hiện muộn. |

### Lý do áp dụng cho Snipe-IT

Snipe-IT quản lý tài sản CNTT, thiết bị, người dùng và lịch sử cấp phát. Nhóm dùng DAST để đánh giá các dấu hiệu rủi ro liên quan đến xác thực, phân quyền, xử lý dữ liệu đầu vào và nguy cơ lộ thông tin qua giao diện web. Kết quả từ ZAP hỗ trợ xác định các vấn đề cần đối chiếu với ca kiểm thử hộp đen, đánh giá mức độ rủi ro và đề xuất khắc phục.

## 2. Chuẩn bị môi trường

- Đối chiếu và ghi phiên bản thực tế của ZAP và Snipe-IT theo [bảng khóa phiên bản](version-lock.md).
- Xác nhận Snipe-IT đang chạy theo [hướng dẫn Docker](setup-docker.md) hoặc [hướng dẫn cài local](setup-local.md).
- Dùng tài khoản lab và dữ liệu giả lập theo [tài liệu môi trường kiểm thử](test-environment.md). Chuẩn bị cách đặt lại dữ liệu trước khi thao tác.
- Giới hạn phiên kiểm thử trong instance Snipe-IT local đã được nhóm cho phép.

| Thuộc tính | Giá trị |
|---|---|
| URL local | `http://localhost:8000` |
| Phiên bản ZAP hoặc image tag | Điền sau khi đối chiếu phiên bản thực tế |
| Chế độ thao tác | Manual Explore và quét thụ động |
| Context hoặc profile | Ghi tên cấu hình thực tế nếu sử dụng |
| Cấu hình xác thực | Dùng tài khoản lab. Nếu lưu cấu hình, chỉ ghi đường dẫn đến bản đã loại bỏ bí mật. |
| Người chạy và thời gian | Điền sau mỗi lần kiểm thử |

## 3. Cài đặt OWASP ZAP

1. Tải bộ cài ZAP Desktop phù hợp với hệ điều hành từ trang chính thức của ZAP.
2. Chạy trình cài đặt và mở ZAP. Nếu hệ điều hành hiển thị cảnh báo, kiểm tra lại nguồn và nhà phát hành của bộ cài trước khi tiếp tục.
3. Chọn cách lưu phiên theo nhu cầu. Khi cần xem lại kết quả, chọn thư mục lưu phiên dành cho đợt kiểm thử.
4. Mở **Quick Start** và chọn **Manual Explore**. ZAP làm proxy giữa trình duyệt kiểm thử và Snipe-IT để ghi nhận các yêu cầu và phản hồi HTTP.

Manual Explore cho phép người kiểm thử đăng nhập bằng tài khoản lab và đi theo các luồng nghiệp vụ thực tế. Cách này hữu ích với các màn hình cần đăng nhập, biểu mẫu nhiều bước và chức năng chỉ xuất hiện sau khi người dùng thao tác.

## 4. Thực hiện quét thụ động

1. Trong **Quick Start → Manual Explore**, nhập `http://localhost:8000`.
2. Chọn trình duyệt có sẵn và bấm **Launch Browser**. Dùng cửa sổ do ZAP mở để lưu lượng đi qua proxy của ZAP.
3. Trên cửa sổ đó, thực hiện các thao tác thông thường nằm trong phạm vi kiểm thử, như đăng nhập bằng tài khoản lab, chuyển trang, tìm kiếm và sử dụng biểu mẫu với dữ liệu giả lập.
4. Kiểm tra cây **Sites** để xem các trang và API đã ghi nhận. Chỉ sử dụng lưu lượng của instance local trong kết quả kiểm thử.
5. Mở tab **Alerts** để xem các cảnh báo phát sinh từ lưu lượng đã ghi nhận. Ghi lại những luồng đã đi qua để biết phạm vi thực tế của lần quét.

## 5. Xuất và lưu báo cáo

1. Sau khi ZAP phân tích xong lưu lượng, chọn **Report → Generate Report**.
2. Tại **Template**, chọn **Risk Confidence HTML Report** nếu mẫu này có sẵn. Mẫu trình bày các cảnh báo theo mức rủi ro và độ tin cậy.
3. Kiểm tra phạm vi báo cáo chỉ gồm Snipe-IT local. Chọn thư mục lưu trong **Report Directory** rồi bấm **Generate Report**.
4. Lưu báo cáo và log đã làm sạch dưới `reports/`. Ghi tên tệp, thời gian chạy và người thực hiện. Kiểm tra cookie, token, mật khẩu, dữ liệu cá nhân và host ngoài phạm vi trước khi commit.
5. Đối chiếu cảnh báo với [ca kiểm thử](test-cases.md) và ghi kết quả vào [danh sách phát hiện](findings.md). Nêu rõ cảnh báo chưa xác minh, khả năng dương tính giả và phần ứng dụng chưa được quan sát.

Nguồn và ảnh minh họa giao diện: [Tài liệu cài đặt ozap.docx](T%C3%A0i%20li%E1%BB%87u%20c%C3%A0i%20%C4%91%E1%BA%B7t%20ozap.docx).
