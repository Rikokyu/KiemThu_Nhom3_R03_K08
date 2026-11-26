# Phân tích hệ thống

> Phụ trách: Ngô Văn Chương
> Trạng thái: Cập nhật theo phạm vi R03 + K08 và phiên bản Snipe-IT đã khóa. Bảng tiến độ ghi nhận đầu việc rà soát kiến trúc, module, nghiệp vụ và URL hoàn thành ngày 11/08/2026.

## Mục tiêu và phạm vi hệ thống

Snipe-IT là ứng dụng quản lý tài sản CNTT. Trong đề tài này, nhóm đánh giá các luồng xác thực, phân quyền, quản lý tài sản, API và các cấu hình HTTP/cookie quan sát được từ instance lab. Mục tiêu là xác định phạm vi có thể kiểm thử lặp lại bằng tay và bằng OWASP ZAP, không khẳng định lỗ hổng khi chưa có kết quả và bằng chứng xác minh.

Môi trường tham chiếu là Snipe-IT `v8.8.0`, commit `2c466fa8a5a68525439bf1bbbc24470d6670c516`, chạy cục bộ bằng Docker Compose; chi tiết tại [`version-lock.md`](version-lock.md), [`setup-docker.md`](setup-docker.md) và [`test-environment.md`](test-environment.md).

## Actor và use case

| Actor | Use case trong phạm vi | Bằng chứng/nguồn |
|---|---|---|
| Người chưa đăng nhập | Thử truy cập route được bảo vệ và xem hành vi chuyển hướng/từ chối | `TC_AUTH_002`, `TC_API_001` |
| Administrator | Đăng nhập, quản lý người dùng, xem/import dữ liệu tài sản mẫu | [`test-environment.md`](test-environment.md), `TC_ASSET_001`, `TC_ASSET_002` |
| End-User | Đăng nhập, kiểm tra quyền xem tài sản và giới hạn trên chức năng quản trị | `TC_AUTH_001`, `TC_AUTH_003`, `TC_AUTHZ_001`, `TC_AUTHZ_002` |
| Người kiểm thử | Chạy test case và thu thập response/header trên target local được duyệt | [`dast-runbook.md`](dast-runbook.md), `TC_COOKIE_001`, `TC_ZAP_001`, `TC_ZAP_002` |

## Module, dependency và cây thư mục liên quan

| Module/khía cạnh | Trách nhiệm trong phạm vi đề tài | Case liên quan |
|---|---|---|
| Xác thực/session | Đăng nhập, yêu cầu xác thực và quan sát session sau đăng nhập | `TC_AUTH_001`–`TC_AUTH_003` |
| Phân quyền | Đối chiếu quyền truy cập/chỉnh sửa theo role | `TC_AUTHZ_001`, `TC_AUTHZ_002` |
| Quản lý tài sản | Xem danh sách và kiểm tra validation dữ liệu | `TC_ASSET_001`, `TC_ASSET_002` |
| API | Kiểm tra xác thực và xử lý tham số trên endpoint được xác nhận trong scope | `TC_API_001`, `TC_API_002` |
| HTTP security | Quan sát thuộc tính cookie và security headers; phân loại cảnh báo ZAP | `TC_COOKIE_001`, `TC_ZAP_001`, `TC_ZAP_002` |
| Môi trường lab | Snipe-IT app và MariaDB được khởi chạy bằng Docker Compose | [`setup-docker.md`](setup-docker.md), [`version-lock.md`](version-lock.md) |

Repository nhóm lưu tài liệu và artefact kiểm thử; mã nguồn ứng dụng được lấy từ upstream theo tag/SHA đã khóa, không giả định nằm trong repository hiện tại.

## Route/luồng cần kiểm thử

| Module/route | Vai trò cần có | Test case liên quan |
|---|---|---|
| `/login` | Chưa đăng nhập / End-User | `TC_AUTH_001`, `TC_AUTH_003` |
| `/assets`, `/users` | Chưa đăng nhập / End-User theo từng case | `TC_AUTH_002`, `TC_AUTHZ_001` |
| `/hardware` | Administrator hoặc role được cấp quyền | `TC_ASSET_001` |
| `/hardware/create`, `/hardware/{id}/edit` | Administrator; End-User để kiểm tra từ chối thao tác | `TC_ASSET_002`, `TC_AUTHZ_002` |
| `/account` và response cookie | End-User hoặc Administrator | `TC_AUTH_003`, `TC_COOKIE_001` |
| API | Role/chưa đăng nhập theo case; route cụ thể cần xác nhận trước khi chạy | `TC_API_001`, `TC_API_002` |
| Target local trong ZAP scope | Người kiểm thử | `TC_ZAP_001`, `TC_ZAP_002` |

Danh sách trên là phạm vi dự kiến theo test case nhóm. Route API và các URL bổ sung phải được xác nhận trên phiên bản đã khóa và ghi lại trước khi thực thi; không dùng wildcard hoặc target ngoài instance lab.

## Giả định và giới hạn phân tích

- Môi trường kiểm thử là instance local do nhóm dựng; không suy rộng kết quả sang hệ thống production hoặc bản Snipe-IT khác.
- Quyền thực tế phụ thuộc cấu hình role của instance. Xác nhận tài khoản và quyền trước mỗi lần chạy.
- Danh sách route là đầu mối kiểm thử, không thay thế việc xác minh route/HTTP method thực tế trên phiên bản đã khóa.
- `TC_API_*` chưa thể chạy cho đến khi endpoint cụ thể và điều kiện xác thực được xác nhận.
- Cảnh báo scanner cần được tái hiện/đối chiếu và lưu evidence trước khi phân loại thành defect.
