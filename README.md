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
- [6. Bảng đối chiếu phần việc với cấu trúc báo cáo A–H](#6-bảng-đối-chiếu-phần-việc-với-cấu-trúc-báo-cáo-ah)
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

Thứ tự dưới đây đặt **Nguyễn Trung Hiệp trước Nguyễn Lê Anh Tuấn** theo yêu cầu của nhóm.

| STT | MSSV | Họ và tên | Email | Vai trò |
|---:|---|---|---|---|
| 1 | 2312610 | Nguyễn Trung Hiệp | 2312610@dlu.edu.vn | **Nhóm trưởng**; quản lý Git, điều phối tiến độ và phụ trách chính thiết kế test case |
| 2 | 2300003 | Nguyễn Lê Anh Tuấn | 2300003@dlu.edu.vn | Phân tích kiến trúc, cấu trúc mã nguồn và luồng dữ liệu |
| 3 | 2312565 | Nguyễn Văn An | 2312565@dlu.edu.vn | Thiết lập môi trường chạy và tài liệu cài đặt/onboarding |
| 4 | 2312588 | Ngô Văn Chương | 2312588@dlu.edu.vn | Thiết lập OWASP ZAP, thực thi DAST và tự động hóa quy trình quét |
| 5 | 2312584 | Đỗ Duy Bien | 2312584@dlu.edu.vn | Tổng hợp kết quả, xác minh phát hiện, phân tích nguyên nhân và báo cáo |

> **Lưu ý:** Tên thành viên được ghi theo danh sách nhóm đã cung cấp. Nếu họ tên chính thức trong danh sách nhà trường có dấu khác, hãy sửa lại trước khi nộp báo cáo.

## 4. Nguyên tắc phân công

- Mỗi thành viên có **một mảng chính**, một đầu ra bàn giao cụ thể và phần phối hợp với các thành viên khác.
- Khối lượng được cân bằng theo chuỗi công việc: phân tích hệ thống → dựng môi trường → thiết kế test → chạy DAST → xác minh và báo cáo.
- Không thành viên nào chỉ làm việc hình thức. Mỗi người cần có commit/PR, tài liệu, bằng chứng kiểm thử hoặc phần trình bày thể hiện đóng góp thực tế.
- Nguyễn Trung Hiệp giữ vai trò điều phối/Git và chủ trì thiết kế test case; các thành viên còn lại cùng góp ý kịch bản, kiểm tra chéo và hỗ trợ chạy test.
- Các phần A–H trong cấu trúc báo cáo được gán người phụ trách chính tại Mục 6; cả nhóm vẫn chịu trách nhiệm đọc và rà soát báo cáo tổng thể.

## 5. Phân công chi tiết theo thành viên

### 5.1. Nguyễn Trung Hiệp — Nhóm trưởng, Git và test case

**Phụ trách chính**

1. Lập kế hoạch công việc, chia task, theo dõi trạng thái trên GitHub Projects/Trello/Jira hoặc bảng task thống nhất của nhóm.
2. Quản lý repository của nhóm: quy ước branch/commit, tạo issue, xem xét pull request, xử lý xung đột và giữ nhánh chính ổn định.
3. Chốt phạm vi DAST cùng nhóm; viết phần nguyên lý kỹ thuật, lý do chọn phạm vi, giả định, rủi ro và tiêu chí pass/fail.
4. Chủ trì lập **Test Model/Test Scenarios/Test Cases**: ID, mục tiêu, precondition, tài khoản/role, input, expected result, dữ liệu test và bằng chứng cần lưu.
5. Tổng hợp cấu hình kiểm thử cần cố định; phối hợp với thành viên phụ trách môi trường để ghi lại commit/tag/SHA của Snipe-IT và phiên bản công cụ.
6. Kiểm tra README, đối chiếu báo cáo A–H và nhắc tiến độ bàn giao; phân công người rà soát chéo.

**Đầu ra cần bàn giao**

- Bảng kế hoạch/task có người phụ trách và trạng thái.
- Quy ước Git và lịch sử commit/PR rõ ràng.
- File test case, ví dụ `docs/test-cases.md`.
- Phần báo cáo D và E; thông tin cố định phiên bản/config trong phần H phối hợp với Nguyễn Văn An.

**Phối hợp**

- Với Nguyễn Lê Anh Tuấn: bảo đảm test case gắn với module và luồng nghiệp vụ đã phân tích.
- Với Nguyễn Văn An: chốt môi trường, phiên bản, dữ liệu mẫu và tài khoản test.
- Với Ngô Văn Chương: rà soát khả năng thực thi kịch bản bằng OWASP ZAP và bổ sung kiểm tra thủ công khi cần.
- Với Đỗ Duy Bien: thống nhất cách ghi trạng thái, mức độ nghiêm trọng, bằng chứng và kết luận của từng phát hiện.

### 5.2. Nguyễn Lê Anh Tuấn — Phân tích hệ thống và kiến trúc

**Phụ trách chính**

1. Khảo sát repository Snipe-IT; mô tả mục tiêu hệ thống, actor/use case chính và các dependency/module liên quan.
2. Đọc cây thư mục, xác định các module có liên quan trực tiếp tới đăng nhập/session, phân quyền và nghiệp vụ tài sản được chọn kiểm thử.
3. Vẽ ít nhất một sơ đồ kiến trúc ở mức component/container và mô tả luồng dữ liệu của 3–5 nghiệp vụ trọng tâm.
4. Ghi nhận các route/page/API và vai trò tương ứng ở mức cần thiết để Nguyễn Trung Hiệp thiết kế test case.
5. Đề xuất các điểm cần quan sát bằng DAST và các giả định/giới hạn của phân tích mã nguồn.
6. Rà soát phần mô tả kiến trúc trong báo cáo, đảm bảo sơ đồ khớp với hệ thống thực tế đã chạy.

**Đầu ra cần bàn giao**

- `docs/system-analysis.md`: mục tiêu, actor/use case, module/dependency và cây thư mục rút gọn.
- Sơ đồ kiến trúc component/container (định dạng Mermaid, draw.io hoặc ảnh rõ nét).
- Sơ đồ luồng dữ liệu của 3–5 nghiệp vụ; danh sách module/route cần kiểm thử.
- Phần báo cáo A và B.

**Phối hợp**

- Với Nguyễn Văn An để sơ đồ và mô tả phù hợp cấu hình chạy thật.
- Với Nguyễn Trung Hiệp để chuyển phát hiện phân tích thành kịch bản kiểm thử có điều kiện và kết quả mong đợi rõ ràng.

### 5.3. Nguyễn Văn An — Thiết lập môi trường và hướng dẫn chạy

**Phụ trách chính**

1. Dựng Snipe-IT trên máy local hoặc bằng Docker theo hướng dẫn chính thức phù hợp với phiên bản nhóm chốt.
2. Ghi rõ hệ điều hành, runtime, dependency, cơ sở dữ liệu/service, phiên bản, port, biến môi trường và bước tạo dữ liệu mẫu.
3. Ghi lại lệnh cài đặt, build/run, kiểm tra trạng thái và cách reset dữ liệu dùng thử. Các lệnh chỉ được đưa vào README sau khi đã chạy thử và xác nhận.
4. Tạo hoặc chuẩn bị dữ liệu giả lập, tài khoản/role phục vụ kiểm thử; không lưu mật khẩu thật vào repository.
5. Chứng minh hệ thống khởi động thành công và tối thiểu **03 luồng nghiệp vụ chạy được** theo yêu cầu báo cáo; lưu ảnh chụp/log có chú thích.
6. Hỗ trợ Ngô Văn Chương cấu hình target local cho ZAP và hỗ trợ cả nhóm dựng lại môi trường khi cần.

**Đầu ra cần bàn giao**

- `docs/setup-local.md` hoặc `docs/setup-docker.md` chứa hướng dẫn onboarding có thể làm lại từ máy mới.
- Bảng phiên bản, biến môi trường mẫu không chứa bí mật, port và dependency.
- Hướng dẫn dữ liệu seed/reset và tài khoản kiểm thử (ghi placeholder hoặc lưu qua kênh an toàn).
- Bằng chứng hệ thống chạy thành công và ít nhất 03 luồng nghiệp vụ.
- Phần báo cáo C; phối hợp hoàn thiện phần H về khả năng tái lập.

**Phối hợp**

- Với Nguyễn Lê Anh Tuấn để xác nhận module và luồng nghiệp vụ.
- Với Ngô Văn Chương để đảm bảo ZAP quét đúng instance local, đúng port và đúng scope.

### 5.4. Ngô Văn Chương — Công cụ DAST và chạy kiểm thử

**Phụ trách chính**

1. Tìm hiểu cấu hình và cách sử dụng OWASP ZAP phục vụ kiểm thử DAST cho web app có đăng nhập, form và session.
2. Thiết lập target/context cho đúng instance local; cấu hình xác thực nếu cần và xác nhận ZAP không truy cập ngoài phạm vi.
3. Chạy kiểm tra thụ động (passive scan) trước; chỉ chạy active scan sau khi nhóm xác nhận scope, có dữ liệu thử nghiệm và có thể reset môi trường.
4. Thiết kế/cấu hình quy trình chạy lặp lại: cấu hình ZAP, script/hướng dẫn chạy, đầu ra report/log và vị trí lưu bằng chứng.
5. Chạy các test case có thể hỗ trợ bằng ZAP; ghi nhận thời gian chạy, cấu hình, cảnh báo, false positive tiềm năng và giới hạn công cụ.
6. Phối hợp xác minh phát hiện cùng Đỗ Duy Bien và Nguyễn Trung Hiệp; không kết luận lỗ hổng chỉ dựa vào cảnh báo tự động chưa được kiểm tra.

**Đầu ra cần bàn giao**

- `dast/` hoặc `tests/dast/`: cấu hình và script/harness cần thiết, loại bỏ thông tin xác thực nhạy cảm.
- `docs/dast-runbook.md`: các bước chạy passive/active scan và cách lưu report.
- OWASP ZAP report/log đã loại bỏ dữ liệu nhạy cảm; danh sách scan profile và target đã dùng.
- Phần báo cáo F và nội dung kỹ thuật liên quan trong D/G.

**Phối hợp**

- Với Nguyễn Trung Hiệp để bảo đảm test case có thể thực thi và tiêu chí pass/fail nhất quán.
- Với Nguyễn Văn An để xác minh target local và dữ liệu thử nghiệm.
- Với Đỗ Duy Bien để phân loại phát hiện, tái hiện và ghi lại kết quả xác minh.

### 5.5. Đỗ Duy Bien — Phân tích kết quả, xác minh và báo cáo

**Phụ trách chính**

1. Thu thập các report/log do Ngô Văn Chương tạo ra, chuẩn hóa vị trí lưu và liên kết mỗi phát hiện với test case/bằng chứng tương ứng.
2. Phối hợp tái hiện thủ công các cảnh báo quan trọng để phân biệt lỗi thật, cảnh báo cần xem xét và false positive.
3. Lập bảng phát hiện gồm ID, URL/module, mô tả, mức độ nghiêm trọng đề xuất, điều kiện tái hiện, kết quả kỳ vọng/thực tế, bằng chứng và trạng thái xác minh.
4. Phân tích nguyên nhân gốc (Root Cause Analysis) ở mức bằng chứng cho phép; ghi rõ điều gì đã xác nhận và điều gì vẫn là giả thuyết.
5. Tổng hợp số liệu: số lượng cảnh báo theo mức độ/nhóm, trạng thái xác minh, test case pass/fail/not run và hạn chế của lần quét.
6. Nếu không tìm thấy lỗi đã xác minh, trình bày report, phạm vi đã quét, cấu hình/coverage đo được và ngưỡng/tiêu chí đã đạt; không tuyên bố hệ thống an toàn tuyệt đối.
7. Hỗ trợ biên tập báo cáo tổng kết, slide, phần trình bày demo và bảng đánh giá đóng góp dựa trên công việc thực tế.

**Đầu ra cần bàn giao**

- `docs/findings.md` hoặc bảng theo dõi defect.
- `reports/summary.md` cùng log/report đã làm sạch dữ liệu nhạy cảm.
- Phần báo cáo G và phần tổng kết kết quả/giới hạn.
- Slide hoặc nội dung trình bày phần kết quả và phân tích nguyên nhân.

**Phối hợp**

- Với Ngô Văn Chương để tái hiện và xác minh cảnh báo.
- Với Nguyễn Trung Hiệp để kiểm tra test case, tiêu chí pass/fail và trạng thái cuối.
- Với Nguyễn Lê Anh Tuấn để đối chiếu phát hiện với kiến trúc/module liên quan.

## 6. Bảng đối chiếu phần việc với cấu trúc báo cáo A–H

Bản hướng dẫn yêu cầu báo cáo theo các mục A–H. Bảng dưới đây quy định người **phụ trách chính** và người **phối hợp**, tránh bỏ sót yêu cầu.

| Phần | Nội dung cần có theo hướng dẫn môn học | Phụ trách chính | Phối hợp |
|---|---|---|---|
| **A** | Mục tiêu hệ thống, actor/use case chính, cây thư mục/module, dependency và luồng dữ liệu | Nguyễn Lê Anh Tuấn | Nguyễn Trung Hiệp, Nguyễn Văn An |
| **B** | Ít nhất 01 sơ đồ kiến trúc component/container; giải thích 3–5 module liên quan trực tiếp tới kiểm thử | Nguyễn Lê Anh Tuấn | Nguyễn Văn An, Nguyễn Trung Hiệp |
| **C** | Môi trường, phiên bản, lệnh build/run, DB/service, seed data; bằng chứng chạy thành công và ít nhất 03 luồng nghiệp vụ | Nguyễn Văn An | Nguyễn Lê Anh Tuấn, Ngô Văn Chương |
| **D** | Nguyên lý DAST, lý do chọn phạm vi, giả định, rủi ro và tiêu chí pass/fail | Nguyễn Trung Hiệp | Ngô Văn Chương, Đỗ Duy Bien |
| **E** | Test Model/Scenario/Case; nêu input, precondition, expected result/invariant và dữ liệu test | Nguyễn Trung Hiệp | Cả nhóm góp ý; Ngô Văn Chương xác nhận khả năng chạy |
| **F** | Mã nguồn test/harness/script có thể chạy lại tự động; README gồm lệnh chạy và dependency | Ngô Văn Chương | Nguyễn Văn An, Nguyễn Trung Hiệp |
| **G** | Log/report/metrics; defect hoặc hành vi bất thường và phân tích nguyên nhân; nếu không có lỗi thì chứng minh coverage/score/threshold đạt | Đỗ Duy Bien | Ngô Văn Chương, Nguyễn Trung Hiệp |
| **H** | Pin commit/tag của repo; lưu cấu hình test; hướng dẫn để người khác chạy lại trên máy mới | Nguyễn Trung Hiệp | Nguyễn Văn An, Ngô Văn Chương |

**Nguyên tắc:** người phụ trách chính chịu trách nhiệm bảo đảm phần đó hoàn chỉnh; người phối hợp cung cấp dữ liệu/bằng chứng và rà soát. Mọi phần phải được ít nhất một thành viên khác kiểm tra trước khi chốt.

## 7. Quy trình làm việc của nhóm

### Bước 1 — Chốt phạm vi và khóa phiên bản

- Xác nhận tổ hợp R03 + K08, phạm vi DAST và giới hạn an toàn.
- Chọn release/tag/commit SHA cụ thể của Snipe-IT, ghi vào `docs/version-lock.md`.
- Tạo repository nhóm và bảng task; lưu link repo nhóm tại phần thông tin dự án khi đã tạo.

### Bước 2 — Phân tích hệ thống

- Nguyễn Lê Anh Tuấn khảo sát mã nguồn, module, dependency, actor/use case và luồng nghiệp vụ.
- Các thành viên xác nhận các luồng phù hợp với phạm vi DAST.
- Hoàn thành sơ đồ kiến trúc và tài liệu phân tích trước khi chuyển sang thiết kế test chi tiết.

### Bước 3 — Dựng môi trường và kiểm chứng nghiệp vụ

- Nguyễn Văn An dựng ứng dụng local/Docker, ghi lại lệnh và cấu hình đã thử thành công.
- Chuẩn bị dữ liệu/tài khoản kiểm thử giả lập và cách reset môi trường.
- Chụp bằng chứng tối thiểu 03 luồng nghiệp vụ chạy được.

### Bước 4 — Thiết kế test case và cấu hình DAST

- Nguyễn Trung Hiệp điều phối thiết kế test case, precondition, input và expected result.
- Ngô Văn Chương ánh xạ các kịch bản vào cấu hình/quy trình OWASP ZAP.
- Cả nhóm review phạm vi, loại tài khoản, dữ liệu và ảnh hưởng tiềm năng trước khi active scan.

### Bước 5 — Thực thi, xác minh và phân tích

- Chạy passive scan, kiểm tra log, sau đó mới active scan trong scope local đã xác nhận.
- Lưu report/log, thời điểm chạy, phiên bản công cụ và cấu hình tương ứng.
- Đỗ Duy Bien phối hợp cùng Chương xác minh cảnh báo; Hiệp cập nhật trạng thái test case.
- Không đánh dấu lỗi chỉ từ tên cảnh báo của công cụ; cần ghi bằng chứng tái hiện hoặc nêu rõ chưa xác minh.

### Bước 6 — Tổng hợp, peer-review và chuẩn bị bảo vệ

- Ghép báo cáo theo đúng A–H, kiểm tra tính nhất quán giữa sơ đồ, test case, log và kết luận.
- Một thành viên không phải tác giả chính rà soát từng phần.
- Tập demo từ máy mới hoặc môi trường sạch theo README; chuẩn bị kịch bản demo, slide và câu trả lời về giới hạn kiểm thử.

### Trạng thái task đề xuất

`Backlog` → `To Do` → `In Progress` → `Review` → `Done`

Một task chỉ được chuyển sang **Done** khi có đầu ra lưu trong repository, có bằng chứng phù hợp và đã được người khác review.

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

Cấu trúc dưới đây là **đề xuất cho tài liệu và artefact của nhóm**, có thể điều chỉnh theo repository thực tế:

```text
.
├── README.md
├── docs/
│   ├── system-analysis.md
│   ├── architecture.md
│   ├── setup-local.md
│   ├── setup-docker.md
│   ├── version-lock.md
│   ├── dast-runbook.md
│   ├── test-cases.md
│   └── findings.md
├── dast/
│   ├── config/          # Cấu hình được phép chia sẻ, đã loại bỏ bí mật
│   └── scripts/         # Script/harness chạy kiểm thử
├── reports/
│   ├── README.md        # Cách tạo/đọc báo cáo; không lưu thông tin nhạy cảm
│   └── evidence/        # Ảnh/log minh chứng đã làm sạch
└── presentation/
    └── README.md        # Ghi chú chuẩn bị slide/demo
```

Không nhất thiết phải đưa toàn bộ repository Snipe-IT vào thư mục con này. Nhóm cần phân biệt rõ mã nguồn upstream với repository chứa tài liệu, cấu hình và artefact kiểm thử của nhóm.

## 9. Kế hoạch kiểm thử DAST

### 9.1. Công cụ và cách tiếp cận

- **Công cụ dự kiến:** OWASP ZAP.
- **Phương pháp:** khảo sát ứng dụng đang chạy, cấu hình scope, thực hiện passive scan, sau khi review mới thực hiện active scan trong môi trường local, sau đó xác minh cảnh báo.
- **Phạm vi target:** ghi URL local thực tế khi nhóm đã dựng thành công, ví dụ `http://localhost:<PORT>`; thay `<PORT>` bằng port đã xác nhận.
- **Xác thực:** nếu kịch bản cần đăng nhập, chuẩn bị tài khoản thử nghiệm riêng cho từng role và kiểm tra ZAP đã duy trì session đúng cách.
- **Đầu ra:** cấu hình đã làm sạch bí mật, log, report, danh sách cảnh báo, kết quả xác minh và giới hạn của lần quét.

### 9.2. Nhóm kịch bản ban đầu

Đây là các **kịch bản dự kiến để nhóm đánh giá sau khi khảo sát hệ thống**, không phải tuyên bố rằng Snipe-IT đang có lỗi.

| ID | Nhóm kiểm thử | Điều kiện/thao tác tổng quát | Kết quả mong đợi |
|---|---|---|---|
| DAST-01 | Truy cập khi chưa đăng nhập | Mở các route được xác định là cần xác thực trong scope local khi chưa có session | Chuyển tới đăng nhập hoặc trả về trạng thái từ chối phù hợp; không để lộ dữ liệu được bảo vệ |
| DAST-02 | Phân quyền theo role | Dùng tài khoản test có quyền khác nhau, thử truy cập chức năng được giới hạn theo ma trận quyền đã xác nhận | Người dùng không đủ quyền không thể đọc/thay đổi tài nguyên vượt quyền |
| DAST-03 | Vòng đời session | Đăng nhập, đăng xuất, sau đăng xuất thử dùng lại session theo cách kiểm thử được phê duyệt | Session bị vô hiệu hóa hoặc hành vi phù hợp với thiết kế bảo mật đã tài liệu hóa |
| DAST-04 | Xử lý dữ liệu đầu vào | Dùng dữ liệu thử nghiệm vô hại trên các form/đầu vào trong phạm vi; kiểm tra phản hồi và mã hóa đầu ra | Dữ liệu được validate/encode phù hợp; không thực thi nội dung đầu vào ngoài ý muốn |
| DAST-05 | HTTP security headers/cookie | Quan sát header và thuộc tính cookie trên các phản hồi liên quan | Ghi nhận cấu hình thực tế và đối chiếu tiêu chí bảo mật mà nhóm đã xác định; nêu rõ header nào áp dụng được trong bối cảnh test |
| DAST-06 | Phát hiện tự động của ZAP | Chạy passive scan và active scan giới hạn trên instance local sau khi chuẩn bị/reset dữ liệu | Mọi cảnh báo được lưu, phân loại và xác minh; cảnh báo chưa xác minh không được trình bày như lỗi đã xác nhận |

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
| Test Case ID | Mã duy nhất, ví dụ `DAST-01` |
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
### DAST-01 — Kiểm tra route cần xác thực khi chưa đăng nhập
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

| Đầu ra | Người phụ trách chính | Tiêu chí hoàn thành |
|---|---|---|
| Phân tích hệ thống và use case | Nguyễn Lê Anh Tuấn | Có mục tiêu, actor/use case, cây thư mục/module, dependency và luồng dữ liệu |
| Sơ đồ kiến trúc và mô tả module | Nguyễn Lê Anh Tuấn | Có ít nhất 01 sơ đồ component/container và giải thích 3–5 module liên quan trực tiếp tới test |
| Hướng dẫn cài đặt/onboarding | Nguyễn Văn An | Có phiên bản, runtime, DB/service, biến môi trường, lệnh build/run, seed/reset data và hướng dẫn làm lại |
| Bằng chứng ứng dụng chạy | Nguyễn Văn An | Có log/ảnh hệ thống chạy thành công và ít nhất 03 luồng nghiệp vụ chạy được |
| Cơ sở lý thuyết và kế hoạch DAST | Nguyễn Trung Hiệp | Nêu lý do chọn, phạm vi, giả định, rủi ro, tiêu chí pass/fail và giới hạn |
| Bộ test case | Nguyễn Trung Hiệp | Case có input, precondition, expected result/invariant và dữ liệu test; có trạng thái chạy thực tế |
| Script/harness và hướng dẫn DAST | Ngô Văn Chương | Người khác có thể chạy theo README; cấu hình target rõ ràng; bí mật đã loại bỏ |
| Log/report và phân tích phát hiện | Đỗ Duy Bien | Có kết quả, bằng chứng, trạng thái xác minh và phân tích nguyên nhân; nếu không có defect đã xác minh thì nêu minh chứng/giới hạn |
| Cố định phiên bản và tái lập | Nguyễn Trung Hiệp + Nguyễn Văn An | Có commit/tag/SHA của upstream, config test và hướng dẫn chạy lại trên máy mới |
| Báo cáo, slide và demo | Cả nhóm; Đỗ Duy Bien tổng hợp | Đầy đủ phần A–H, nhất quán giữa báo cáo và artefact, mỗi thành viên trình bày được phần mình phụ trách |

### Checklist trước khi nộp

- [ ] Chốt và lưu commit SHA/tag của Snipe-IT.
- [ ] Có repository nhóm và lịch sử commit/PR thể hiện đóng góp thực tế.
- [ ] Có bảng task, người phụ trách, trạng thái và đầu ra tương ứng.
- [ ] Báo cáo có đầy đủ phần A–H.
- [ ] Có sơ đồ kiến trúc và luồng dữ liệu.
- [ ] Có hướng dẫn setup đã được chạy thử và ít nhất 03 luồng nghiệp vụ có bằng chứng.
- [ ] Có test case với precondition, input, expected result, actual result và trạng thái.
- [ ] Có script/config và hướng dẫn chạy lại DAST.
- [ ] Có log/report, phân loại cảnh báo và xác minh phát hiện.
- [ ] Không có credential, cookie, token hoặc dữ liệu nhạy cảm trong repository/report.
- [ ] Active scan chỉ chạy trên instance local được phép kiểm thử.
- [ ] Có hướng dẫn để người khác làm lại trên máy mới.
- [ ] Đã peer-review và tập demo trước khi bảo vệ.

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

Các thông tin sau hiện chưa có trong tài liệu phân công; người phụ trách môi trường cập nhật sau khi kiểm chứng, **không điền bằng phỏng đoán**.

| Thông tin | Giá trị cần cập nhật | Người cập nhật |
|---|---|---|
| Repository nhóm | `<URL_REPOSITORY_NHÓM>` | Nguyễn Trung Hiệp |
| Repository upstream | `https://github.com/grokability/snipe-it` | Nguyễn Trung Hiệp |
| Release/tag upstream | `<TAG_ĐÃ_CHỌN>` | Nguyễn Trung Hiệp + Nguyễn Văn An |
| Commit SHA upstream | `<COMMIT_SHA_ĐÃ_CHỐT>` | Nguyễn Trung Hiệp + Nguyễn Văn An |
| Hệ điều hành/môi trường | `<HỆ_ĐIỀU_HÀNH_VÀ_PHIÊN_BẢN>` | Nguyễn Văn An |
| Cách dựng | `<LOCAL_HOẶC_DOCKER_COMPOSE>` | Nguyễn Văn An |
| DB/service và phiên bản | `<GHI_THEO_MÔI_TRƯỜNG_THỰC_TẾ>` | Nguyễn Văn An |
| Port/URL local | `<URL_LOCAL_ĐÃ_KIỂM_TRA>` | Nguyễn Văn An + Ngô Văn Chương |
| Phiên bản OWASP ZAP | `<PHIÊN_BẢN_ĐÃ_DÙNG>` | Ngô Văn Chương |
| Lệnh chạy DAST | `<LỆNH_ĐÃ_CHẠY_THÀNH_CÔNG>` | Ngô Văn Chương |
| Vị trí report/evidence | `<ĐƯỜNG_DẪN_TRONG_REPO>` | Đỗ Duy Bien |

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
