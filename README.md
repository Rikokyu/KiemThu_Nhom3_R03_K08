# README -- Phân công công việc nhóm

## Đề tài môn Kiểm thử phần mềm: R03 -- Snipe-IT kết hợp K08 -- DAST

> **Giảng viên:** Nguyễn Thế Lâm\
> **Đơn vị:** Khoa Công nghệ Thông tin -- Trường Đại học Đà Lạt\
> **Mô hình làm việc:** Agile/Scrum, quản lý mã nguồn bằng Git\
> **Kỹ thuật kiểm thử nâng cao:** DAST (Dynamic Application Security
> Testing)\
> **Công cụ DAST dự kiến:** OWASP ZAP\
> **Phạm vi an toàn:** Chỉ kiểm thử phiên bản Snipe-IT do nhóm tự triển
> khai trong môi trường local/lab được phép kiểm thử.

---

## 1. Giới thiệu đề tài

### 1.1. Đề tài được lựa chọn

Nhóm lựa chọn tổ hợp:

- **R03 -- Snipe-IT:** phần mềm mã nguồn mở phục vụ quản lý tài sản
  CNTT.
- **K08 -- DAST:** kiểm thử bảo mật động, thực hiện kiểm tra ứng dụng
  khi ứng dụng đang chạy.

Kho mã nguồn Snipe-IT theo hướng dẫn môn học:\
https://github.com/grokability/snipe-it

Tài liệu OWASP ZAP:\
https://www.zaproxy.org/docs/

### 1.2. Mục tiêu

1.  Đọc hiểu cấu trúc tổng quan của Snipe-IT, xác định các thành phần và
    luồng nghiệp vụ liên quan đến phạm vi kiểm thử.
2.  Cài đặt và chạy Snipe-IT trong môi trường local hoặc Docker, ghi lại
    cấu hình và các bước để thành viên khác có thể dựng lại.
3.  Nghiên cứu DAST, các loại kiểm tra phù hợp, giới hạn, giả định và
    tiêu chí đánh giá.
4.  Xây dựng kịch bản kiểm thử bảo mật động tập trung vào một phạm vi
    vừa sức, ưu tiên luồng đăng nhập, phiên làm việc, biểu mẫu và phân
    quyền nếu có thể tiếp cận trong môi trường đã dựng.
5.  Chạy OWASP ZAP trên hệ thống local được cấp phép, lưu cấu hình, log,
    báo cáo và bằng chứng.
6.  Xác minh thủ công các cảnh báo quan trọng, phân loại kết quả, phân
    tích nguyên nhân và đề xuất hướng xử lý; không mặc định mọi cảnh báo
    đều là lỗ hổng đã được xác nhận.
7.  Hoàn thiện báo cáo, README chạy lại, lịch sử commit và tài liệu
    trình bày.

### 1.3. Phạm vi và nguyên tắc

- Nhóm không có mục tiêu kiểm thử toàn bộ Snipe-IT. Chọn khoảng **3--5
  module hoặc luồng nghiệp vụ** có liên quan trực tiếp đến kiểm thử,
  phù hợp thời gian và cấu hình máy.
- Phạm vi cuối cùng phải được chốt sau khi cài đặt, khảo sát ứng dụng
  và thống nhất trong nhóm.
- Chỉ quét ứng dụng do nhóm triển khai trên máy cá nhân hoặc môi
  trường lab được cho phép. **Không chạy active scan trên website công
  khai, máy chủ bên thứ ba hoặc hệ thống chưa có quyền kiểm thử.**
- Không ghi mật khẩu, token, cookie phiên hoặc dữ liệu nhạy cảm vào
  Git, README hay báo cáo.
- Không kết luận hệ thống an toàn tuyệt đối chỉ vì công cụ không phát
  hiện cảnh báo.
- Khóa phiên bản bằng release/tag hoặc commit SHA và lưu lại thông tin
  này trong báo cáo.
- Phân biệt rõ: cảnh báo do công cụ phát hiện, kết quả đã xác minh,
  false positive/không xác nhận được và giới hạn kiểm thử.

---

## 2. Thông tin thành viên

---

                STT Mã sinh viên  Họ và tên     Email                Vai trò

---

                  1 2312610       Nguyễn Trung  2312610@dlu.edu.vn   **Nhóm
                                  Hiệp                               trưởng**,
                                                                     điều phối dự
                                                                     án và phụ
                                                                     trách phương
                                                                     pháp DAST

                  2 2300003       Nguyễn Lê Anh 2300003@dlu.edu.vn   Phụ trách
                                  Tuấn                               thiết lập môi
                                                                     trường và
                                                                     phân tích hệ
                                                                     thống


                  3 2312565       Nguyễn Văn An 2312565@dlu.edu.vn   Phụ trách
                                                                     thiết kế kịch
                                                                     bản và tiêu
                                                                     chí kiểm thử

                  4 2312588       Ngô Văn       2312588@dlu.edu.vn   Phụ trách
                                  Chương                             triển khai
                                                                     chạy quét
                                                                     DAST và quản
                                                                     lý kết quả kỹ
                                                                     thuật

                  5 2312584       Đỗ Duy Biên   2312584@dlu.edu.vn   Phụ trách
                                                                     bằng chứng,
                                                                     tài liệu tái
                                                                     lập, tích hợp
                                                                     báo cáo và hỗ
                                                                     trợ quản lý
                                                                     cấu hình

---

> Mã sinh viên và email được ghi theo danh sách nhóm đã cung cấp. Nhóm
> nên đối chiếu lại với danh sách chính thức trước khi nộp.

---

## 3. Nguyên tắc phân công để cân bằng công việc

- Mỗi thành viên có **một phần việc chính chịu trách nhiệm đến cùng**,
  có sản phẩm bàn giao cụ thể.
- Mỗi thành viên cùng tham gia review chéo ít nhất một phần của thành
  viên khác.
- Nhóm trưởng điều phối, theo dõi tiến độ và kiểm tra tính nhất quán;
  không làm thay toàn bộ công việc của các thành viên.
- Những phần cần phối hợp (dựng môi trường, chọn phạm vi, xác minh
  cảnh báo, hoàn thiện báo cáo) được ghi rõ người chính và người hỗ
  trợ.
- Khối lượng được cân đối theo đầu ra: tài liệu phân tích/môi trường,
  thiết kế kiểm thử, phương pháp DAST/điều phối, thực thi và phân tích
  kết quả, tích hợp bằng chứng/tái lập. Sau Sprint đầu tiên, nhóm
  trưởng rà soát lại khối lượng thực tế và điều chỉnh nếu có chênh
  lệch.

---

## 4. Bảng phân công tổng quan

---

Thành viên Phần việc chính Công việc cụ thể Sản phẩm bàn giao

---

**Nguyễn Trung Điều phối dự án Chốt scope với nhóm; Kế hoạch Sprint;
Hiệp -- Nhóm và cơ sở phương quản lý Sprint/task; phần lý thuyết
trưởng** pháp DAST nghiên cứu nguyên lý, DAST; phạm vi và
giới hạn, giả định, tiêu chí đánh
rủi ro và tiêu chí giá; biên bản
pass/fail DAST; thống họp/quyết định;
nhất cấu hình quét; checklist chất
kiểm tra tiến độ và lượng
chất lượng

**Nguyễn Lê Anh Phân tích hệ Khảo sát repository, Tài liệu kiến
Tuấn** thống và thiết dependency, cấu trúc trúc; sơ đồ;
lập môi trường thư mục; dựng hướng dẫn cài
Snipe-IT đặt; bằng chứng
local/Docker; ghi ứng dụng khởi
phiên bản, cấu hình, chạy
lệnh chạy; lập sơ đồ  
 component/container  
 và mô tả luồng dữ  
 liệu

**Nguyễn Văn An** Thiết kế mô hình Chọn luồng nghiệp Test plan; bảng
và kịch bản kiểm vụ/phạm vi cần kiểm test cases; dữ
thử tra; xác định actor, liệu kiểm thử an
quyền và tiền điều toàn; checklist
kiện; lập test xác minh
scenarios/cases;  
 chuẩn bị dữ liệu kiểm
thử; xây dựng  
 checklist xác minh  
 thủ công

**Ngô Văn Thực thi DAST và Cấu hình OWASP ZAP; Cấu hình/quy
Chương** phân tích kỹ thực hiện kiểm tra trình chạy ZAP;
thuật kết quả passive/active phù log và báo cáo
hợp trên local; lưu quét; danh sách
log/report; tái hiện phát hiện; hồ sơ
cảnh báo trong phạm xác minh cảnh báo
vi được phép; ghi  
 nhận bước tái hiện và
phân loại kết quả

**Đỗ Duy Biên** Bằng chứng, khả Tổ chức thư mục Thư mục evidence;
năng tái lập và artifact; thu thập README tái lập;
tích hợp báo cáo ảnh chụp bằng chứng bảng theo dõi
hệ thống và luồng artifact; bản báo
nghiệp vụ; kiểm tra cáo tích hợp;
README để người khác checklist nộp bài
chạy lại; ghi repo  
 tag/commit SHA, cấu  
 hình test và  
 dependency; ghép báo  
 cáo và hỗ trợ slide

---

---

## 5. Phân công chi tiết theo thành viên

### 5.1. Nguyễn Trung Hiệp -- Nhóm trưởng, điều phối và phương pháp DAST

**Mục tiêu:** Giữ tiến độ, thống nhất phương pháp kiểm thử và bảo đảm
đầu ra của các thành viên ghép được thành một báo cáo nhất quán.

**Nhiệm vụ:**

1.  Tạo bảng công việc trên GitHub Projects, Trello hoặc Jira; chia task
    theo Sprint, người phụ trách, hạn hoàn thành và trạng thái.
2.  Thống nhất quy tắc Git, cách đặt tên branch, cách review pull
    request và cách ghi commit.
3.  Điều phối việc chốt phạm vi kiểm thử, mục tiêu, giả định và môi
    trường an toàn.
4.  Nghiên cứu DAST: nguyên lý, cách hoạt động, ưu điểm, giới hạn, loại
    vấn đề có thể phát hiện và những vấn đề công cụ không thể tự xác
    nhận.
5.  Giải thích lý do lựa chọn OWASP ZAP và cách sử dụng phù hợp với phạm
    vi môn học.
6.  Cùng thành viên phụ trách thực thi thống nhất chế độ quét, phạm vi
    URL, cách xử lý xác thực/session và cách lưu kết quả.
7.  Xác định tiêu chí pass/fail cho từng kịch bản dựa trên expected
    result; không dùng duy nhất số lượng cảnh báo làm tiêu chí thành
    công.
8.  Theo dõi rủi ro, gỡ vướng, tổ chức review định kỳ và kiểm tra các
    phần A--H trước khi nộp.
9.  Tổng hợp nội dung trình bày về mục tiêu, phương pháp, giới hạn và
    kết luận; phân chia thời lượng thuyết trình công bằng cho cả nhóm.

**Bàn giao:**

- `docs/project-plan.md`
- `docs/dast-methodology.md`
- `docs/scope-and-acceptance-criteria.md`
- Bảng task/Sprint và biên bản quyết định quan trọng
- Checklist review báo cáo, mã nguồn và bản trình bày

**Tiêu chí hoàn thành:**

- Task có người chịu trách nhiệm, trạng thái và sản phẩm bàn giao.
- Phạm vi DAST được giới hạn ở hệ thống local/lab có quyền kiểm thử.
- Phương pháp, giả định, rủi ro và tiêu chí pass/fail được ghi rõ.
- Có lịch sử commit/review thể hiện đóng góp của các thành viên.

### 5.2. Nguyễn Lê Anh Tuấn -- Phân tích hệ thống và môi trường

**Mục tiêu:** Bảo đảm nhóm hiểu hệ thống ở mức cần thiết và mọi thành
viên có thể khởi chạy cùng một phiên bản Snipe-IT.

**Nhiệm vụ:**

1.  Clone repository Snipe-IT từ
    https://github.com/grokability/snipe-it.
2.  Khảo sát README, hướng dẫn triển khai, cấu trúc thư mục, framework,
    dependency và các service cần thiết.
3.  Cùng nhóm chọn release/tag hoặc commit SHA; ghi rõ phiên bản được sử
    dụng.
4.  Thiết lập Snipe-IT trên local hoặc bằng Docker theo phương án phù
    hợp; ghi lại yêu cầu môi trường, biến cấu hình, cổng, cơ sở dữ
    liệu/service và các lệnh build/run.
5.  Ghi lại các bước xử lý lỗi cài đặt thường gặp nếu phát sinh.
6.  Vẽ ít nhất một sơ đồ kiến trúc mức component/container; mô tả luồng
    dữ liệu của 3--5 nghiệp vụ trọng tâm hoặc các luồng phù hợp với
    scope đã chốt.
7.  Giải thích 3--5 module liên quan trực tiếp tới kiểm thử; tránh mô tả
    toàn bộ codebase không cần thiết.
8.  Cung cấp bằng chứng ứng dụng chạy thành công và phối hợp xác nhận ít
    nhất 3 luồng nghiệp vụ có thể thực hiện được.

**Bàn giao:**

- `docs/system-analysis.md`
- `docs/architecture-diagram.png` hoặc tệp sơ đồ nguồn tương ứng
- `docs/setup-guide.md`
- Bằng chứng chạy ứng dụng trong `evidence/setup/`
- Danh sách phiên bản, dependency và lệnh chạy

**Tiêu chí hoàn thành:**

- Thành viên khác làm theo tài liệu có thể dựng môi trường.
- Có phiên bản repo cố định và cấu hình cần thiết nhưng không chứa bí
  mật.
- Sơ đồ và mô tả khớp với hệ thống thực tế đã dựng.
- Có bằng chứng hệ thống chạy và ít nhất 3 luồng nghiệp vụ chạy được.

### 5.3. Nguyễn Văn An -- Thiết kế test plan và kịch bản kiểm thử

**Mục tiêu:** Chuyển phạm vi DAST thành các kịch bản rõ ràng, có thể
thực hiện và đánh giá được.

**Nhiệm vụ:**

1.  Phối hợp với Tuấn và Hiệp chọn 3--5 luồng/module phù hợp, ưu tiên
    những luồng liên quan đăng nhập, phiên làm việc, form và phân quyền
    nếu hệ thống đã dựng hỗ trợ.
2.  Xác định actor, quyền truy cập, điều kiện trước khi chạy, dữ liệu
    cần chuẩn bị và trạng thái ban đầu.
3.  Lập test scenarios/test cases cho các luồng được chọn; nêu rõ mục
    tiêu, input, precondition, bước thực hiện, expected result và bằng
    chứng cần lưu.
4.  Lập checklist kiểm tra thủ công các cảnh báo do ZAP đưa ra, gồm bước
    tái hiện, kết quả mong đợi, kết quả quan sát và cách phân loại.
5.  Phối hợp với Chương để bảo đảm các kịch bản thiết kế có thể được
    kiểm tra bằng cấu hình DAST hoặc kiểm tra thủ công bổ trợ.
6.  Theo dõi tình trạng từng test case: chưa chạy, đạt, không đạt, bị
    chặn hoặc chưa thể kết luận.
7.  Đề xuất cách tái kiểm tra sau khi điều chỉnh cấu hình hoặc xử lý vấn
    đề; không tự sửa mã nguồn sản phẩm nếu chưa được nhóm thống nhất.

**Bàn giao:**

- `docs/test-plan.md`
- `docs/test-cases.md` hoặc bảng test case
- `docs/manual-verification-checklist.md`
- Bảng trạng thái chạy test và liên kết tới evidence

**Mẫu test case đề xuất:**

Trường Nội dung cần ghi

---

Test Case ID Mã duy nhất, ví dụ `DAST-TC-01`
Mục tiêu Vấn đề/hành vi cần kiểm tra
Phạm vi/URL Đường dẫn trong môi trường local đã chốt
Actor/Role Người dùng hoặc vai trò liên quan
Preconditions Điều kiện trước khi chạy
Input/Test data Dữ liệu kiểm thử không nhạy cảm
Steps Các bước thực hiện
Expected result Kết quả mong đợi
Actual result Kết quả thực tế
Status Pass / Fail / Blocked / Inconclusive
Evidence Đường dẫn log, ảnh hoặc báo cáo
Notes Giới hạn, ghi chú xác minh

**Tiêu chí hoàn thành:**

- Mỗi test case có input, precondition, expected result và dữ liệu
  kiểm thử.
- Có tiêu chí phân biệt lỗi thực tế với cảnh báo chưa xác minh.
- Các test case được liên kết với kết quả và evidence tương ứng.

### 5.4. Ngô Văn Chương -- Thực thi OWASP ZAP và quản lý phát hiện

**Mục tiêu:** Thực hiện kiểm tra động có kiểm soát, tạo ra kết quả có
thể kiểm tra lại và phân tích được.

**Nhiệm vụ:**

1.  Kiểm tra ứng dụng local đã chạy ổn định trước khi quét.
2.  Cài đặt và cấu hình OWASP ZAP theo hướng dẫn chính thức.
3.  Xác định target/scope đúng với địa chỉ local của nhóm; kiểm tra
    không đưa host ngoài phạm vi vào mục tiêu quét.
4.  Chạy các bước phù hợp như passive scan; chỉ chạy active scan khi đã
    xác nhận môi trường là lab của nhóm và nhóm đã thống nhất phạm vi.
5.  Nếu cần kiểm tra luồng yêu cầu xác thực, phối hợp thiết lập
    phiên/đăng nhập theo cách phù hợp; ghi rõ phần nào được quét có xác
    thực và phần nào không.
6.  Lưu báo cáo ZAP, cấu hình cần thiết, log, thời điểm chạy và phiên
    bản công cụ.
7.  Phối hợp với An xác minh cảnh báo quan trọng; ghi lại bước tái hiện,
    kết quả quan sát và phân loại như đã xác nhận, false positive hoặc
    chưa đủ bằng chứng.
8.  Không thực hiện khai thác phá hoại, không lấy cắp dữ liệu, không gây
    tải quá mức và không thử nghiệm ngoài phạm vi được phép.
9.  Đề xuất cách chạy lại để thành viên khác tái lập được kết quả.

**Bàn giao:**

- `tests/dast/` chứa script/cấu hình hỗ trợ chạy lại nếu có
- `reports/zap/` chứa báo cáo xuất ra đã kiểm tra không có thông tin
  nhạy cảm
- `docs/findings.md` hoặc bảng phát hiện
- `evidence/dast/` chứa bằng chứng đã loại bỏ thông tin bí mật
- Hướng dẫn phiên bản công cụ và quy trình chạy

**Mẫu ghi nhận phát hiện:**

Trường Nội dung cần ghi

---

Finding ID Mã phát hiện, ví dụ `DAST-F-01`
Tên cảnh báo Theo báo cáo công cụ
Mức độ Theo công cụ, kèm đánh giá của nhóm
URL/Module Đích trong môi trường local
Bằng chứng Request/response đã làm sạch, log hoặc ảnh
Xác minh Các bước kiểm tra thủ công
Kết luận Confirmed / False positive / Inconclusive
Ảnh hưởng Mô tả tác động có bằng chứng
Đề xuất Hướng xử lý hoặc kiểm tra bổ sung
Giới hạn Điều kiện khiến chưa thể kết luận

**Tiêu chí hoàn thành:**

- Có báo cáo/log chạy quét và ghi lại cấu hình quan trọng.
- Kết quả được liên kết với scope và thời điểm chạy.
- Cảnh báo trọng yếu có ghi nhận xác minh, hoặc nêu rõ vì sao chưa thể
  xác minh.
- Không đưa thông tin nhạy cảm vào repository hoặc báo cáo.

### 5.5. Đỗ Duy Biên -- Evidence, tái lập và tích hợp báo cáo

**Mục tiêu:** Bảo đảm kết quả được lưu trữ có tổ chức và giảng
viên/thành viên khác có thể kiểm tra lại.

**Nhiệm vụ:**

1.  Thiết kế cây thư mục cho tài liệu, test, báo cáo, log và bằng chứng.
2.  Phối hợp với Tuấn thu thập ảnh/chứng cứ ứng dụng chạy thành công và
    tối thiểu 3 luồng nghiệp vụ.
3.  Kiểm tra hướng dẫn README/setup trên một môi trường khác hoặc nhờ
    thành viên khác làm theo để phát hiện bước còn thiếu.
4.  Ghi lại repository URL, release/tag hoặc commit SHA; lưu các cấu
    hình test cần thiết và dependency.
5.  Kiểm tra các tệp xuất từ ZAP trước khi commit; loại bỏ cookie,
    token, mật khẩu, dữ liệu cá nhân và thông tin nhạy cảm.
6.  Tổ chức evidence theo mã test case/finding để người đọc tìm được
    bằng chứng nhanh.
7.  Tích hợp nội dung từ các thành viên thành báo cáo thống nhất về
    thuật ngữ, cấu trúc, hình ảnh, bảng và tham chiếu.
8.  Chuẩn bị checklist sản phẩm nộp và hỗ trợ nhóm trưởng rà soát slide,
    phân chia phần trình bày.

**Bàn giao:**

- `README.md` tại thư mục gốc
- `docs/reproducibility.md`
- `evidence/` được tổ chức theo nội dung
- `docs/report-checklist.md`
- Bản báo cáo đã tích hợp và danh sách tệp nộp

**Tiêu chí hoàn thành:**

- Tài liệu cho biết cách dựng và chạy lại test trên máy mới.
- Repo/tag/commit SHA và dependency được ghi lại.
- Evidence được đặt tên rõ, không chứa bí mật.
- Báo cáo có đủ các phần A--H theo yêu cầu môn học.

---

## 6. Ma trận phân công theo cấu trúc báo cáo A--H

Tài liệu môn học yêu cầu báo cáo cơ bản có các phần A--H. Bảng sau phân
người chịu trách nhiệm chính và người phối hợp:

---

Phần Nội dung bắt buộc Người chính Người phối hợp

---

**A** Mục tiêu hệ thống, Nguyễn Lê Anh Nguyễn Trung Hiệp
actor/use case, cây Tuấn  
 thư mục/module,  
 dependency, luồng dữ  
 liệu

**B** Ít nhất 1 sơ đồ kiến Nguyễn Lê Anh Đỗ Duy Biên
trúc Tuấn  
 component/container và  
 giải thích 3--5 module  
 liên quan kiểm thử

**C** Môi trường, phiên bản, Nguyễn Lê Anh Đỗ Duy Biên
lệnh build/run, Tuấn  
 DB/service, seed data;  
 bằng chứng hệ thống  
 chạy và ít nhất 3  
 luồng nghiệp vụ

**D** Nguyên lý DAST, lý do Nguyễn Trung Hiệp Ngô Văn Chương
chọn phạm vi, giả  
 định, rủi ro, tiêu chí  
 pass/fail

**E** Test Nguyễn Văn An Ngô Văn Chương
Model/Scenario/Case;  
 input, precondition,  
 expected  
 result/invariant, dữ  
 liệu test

**F** Mã nguồn Ngô Văn Chương Nguyễn Trung
test/harness/script có Hiệp, Đỗ Duy Biên
thể chạy lại; README,  
 lệnh chạy và  
 dependency

**G** Log/report/metrics; Ngô Văn Chương Nguyễn Văn An,
phát hiện hoặc hành vi Nguyễn Trung Hiệp
bất thường; phân tích  
 nguyên nhân; nếu không  
 có lỗi thì chứng minh  
 phạm vi/coverage/tiêu  
 chí đã đạt

**H** Pin commit/tag repo; Đỗ Duy Biên Nguyễn Lê Anh
lưu cấu hình test; Tuấn, Ngô Văn
hướng dẫn người khác Chương
chạy lại trên máy mới

---

**Lưu ý:** Đây là người chịu trách nhiệm chính, không có nghĩa các thành
viên khác không cần đọc hoặc review phần đó. Mỗi phần phải được ít nhất
một thành viên khác kiểm tra trước khi tích hợp.

---

## 7. Quy trình làm việc Agile/Scrum đề xuất

### Sprint 0 -- Chốt đề tài và tổ chức công việc

**Việc cần làm:**

- Xác nhận 5 thành viên, vai trò và phạm vi ban đầu.
- Chốt tổ hợp R03 + K08; kiểm tra yêu cầu đăng ký theo lớp.
- Tạo repository Git và bảng quản lý task.
- Chốt quy ước branch, commit, pull request và review.
- Chọn phạm vi môi trường thử nghiệm; thống nhất chỉ quét local/lab.
- Ghi lại repository, tag/release hoặc commit SHA dự kiến sử dụng.

**Đầu ra:** danh sách thành viên, kế hoạch công việc, repository nhóm,
bảng task, phạm vi ban đầu.

### Sprint 1 -- Phân tích và dựng hệ thống

**Việc cần làm:**

- Tuấn khảo sát codebase và dựng ứng dụng.
- Hiệp theo dõi task và xác nhận phạm vi với cả nhóm.
- An khảo sát các luồng nghiệp vụ có thể dùng làm kịch bản.
- Chương kiểm tra khả năng truy cập ứng dụng từ công cụ kiểm thử.
- Biên kiểm tra hướng dẫn setup và thu thập bằng chứng.

**Đầu ra:** tài liệu cài đặt, sơ đồ kiến trúc bản đầu, bằng chứng ứng
dụng chạy, danh sách luồng nghiệp vụ.

### Sprint 2 -- Thiết kế DAST và test cases

**Việc cần làm:**

- Hiệp hoàn thiện cơ sở lý thuyết, phạm vi, giả định, rủi ro và tiêu
  chí đánh giá.
- An hoàn thiện test plan, test cases và checklist xác minh.
- Chương thiết lập OWASP ZAP và thử quy trình quét trên local.
- Tuấn hỗ trợ xác định module/URL và giải thích luồng nghiệp vụ.
- Biên chuẩn hóa thư mục evidence và cấu trúc tài liệu.

**Đầu ra:** test plan, test cases, cấu hình thử nghiệm, checklist
evidence.

### Sprint 3 -- Chạy kiểm thử, xác minh và phân tích

**Việc cần làm:**

- Chương chạy các bước kiểm thử đã thống nhất, lưu log và báo cáo.
- An kiểm tra kết quả theo test cases và hỗ trợ xác minh cảnh báo.
- Hiệp rà soát việc tuân thủ scope, tiêu chí pass/fail và giới hạn kết
  luận.
- Tuấn hỗ trợ phân tích module/luồng khi cần.
- Biên tổ chức bằng chứng và kiểm tra không lộ thông tin nhạy cảm.

**Đầu ra:** báo cáo ZAP, danh sách phát hiện, trạng thái test case,
evidence và phân tích kết quả.

### Sprint 4 -- Tích hợp báo cáo và chuẩn bị bảo vệ

**Việc cần làm:**

- Mỗi thành viên hoàn thiện phần mình phụ trách.
- Biên tích hợp định dạng báo cáo và kiểm tra khả năng tái lập.
- Tuấn kiểm tra tài liệu setup và sơ đồ.
- An rà soát bảng test cases và liên kết bằng chứng.
- Chương kiểm tra script/cấu hình chạy lại và báo cáo công cụ.
- Hiệp rà soát tổng thể, điều phối peer-review và phân chia thuyết
  trình.

**Đầu ra:** báo cáo hoàn chỉnh A--H, README, mã nguồn/cấu hình test,
log/report, slide và checklist nộp.

> Mốc thời gian cụ thể cần được nhóm đối chiếu với lịch học và thông báo
> của giảng viên. Theo hướng dẫn môn học, báo cáo giữa kỳ tập trung vào
> demo hệ thống chạy, sơ đồ kiến trúc, tài liệu on-boarding và kế hoạch
> áp dụng kỹ thuật kiểm thử; báo cáo cuối kỳ bao gồm demo automation, mã
> nguồn kiểm thử và báo cáo tổng kết.

---

## 8. Quy ước quản lý mã nguồn và task

### 8.1. Cấu trúc thư mục đề xuất

Cấu trúc dưới đây là gợi ý tổ chức sản phẩm nhóm; có thể điều chỉnh theo
thực tế repository:

```text
R03-SnipeIT-K08-DAST/
├── README.md
├── docs/
│   ├── project-plan.md
│   ├── system-analysis.md
│   ├── architecture-diagram.png
│   ├── setup-guide.md
│   ├── dast-methodology.md
│   ├── scope-and-acceptance-criteria.md
│   ├── test-plan.md
│   ├── test-cases.md
│   ├── manual-verification-checklist.md
│   ├── findings.md
│   ├── reproducibility.md
│   └── report-checklist.md
├── tests/
│   └── dast/
├── reports/
│   └── zap/
└── evidence/
    ├── setup/
    ├── business-flows/
    └── dast/
```

Không đưa vào Git các tệp chứa mật khẩu, `.env` có bí mật,
cookie/session token hoặc dữ liệu nhạy cảm. Với tệp báo cáo lớn, nhóm
thống nhất cách lưu trữ và liên kết để mọi thành viên có thể truy cập.

### 8.2. Quy trình Git

1.  Mỗi task thực hiện trên branch riêng, ví dụ `docs/system-analysis`,
    `test/dast-cases` hoặc `test/zap-scan`.
2.  Commit cần mô tả đúng thay đổi, ví dụ:
    - `docs: add system setup guide`
    - `test: add DAST test scenarios`
    - `test: document ZAP findings`
    - `docs: integrate final report`
3.  Tạo pull request hoặc yêu cầu thành viên khác review trước khi nhập
    vào nhánh chính.
4.  Không commit thông tin xác thực hoặc dữ liệu nhạy cảm.
5.  Ghi lại tag/release hoặc commit SHA của Snipe-IT được kiểm thử.
6.  Lưu hướng dẫn chạy và cấu hình cần thiết để thành viên khác có thể
    tái lập kết quả.

### 8.3. Theo dõi task

Mỗi task trên Trello/Jira/GitHub Projects nên có:

- Tên task và mô tả đầu ra.
- Người chịu trách nhiệm chính.
- Người review.
- Ngày bắt đầu và hạn hoàn thành.
- Trạng thái: `To Do`, `In Progress`, `Review`, `Done`.
- Liên kết commit/PR, tài liệu hoặc evidence liên quan.
- Vướng mắc và cách xử lý nếu có.

---

## 9. Tiêu chí nghiệm thu chung

Nhóm chỉ đánh dấu hoàn thành khi đã kiểm tra các tiêu chí liên quan:

- [ ] Đã ghi rõ mục tiêu, scope và phiên bản Snipe-IT được kiểm thử.
- [ ] Có phân tích hệ thống, cây thư mục/module, dependency và luồng
      dữ liệu.
- [ ] Có ít nhất một sơ đồ kiến trúc component/container.
- [ ] Có hướng dẫn cài đặt với phiên bản, cấu hình, service/DB và lệnh
      chạy.
- [ ] Có bằng chứng hệ thống chạy thành công và ít nhất 3 luồng nghiệp
      vụ chạy được.
- [ ] Có tài liệu DAST: nguyên lý, lý do chọn, giả định, rủi ro, giới
      hạn và tiêu chí pass/fail.
- [ ] Có test scenarios/cases với input, precondition, expected result
      và dữ liệu test.
- [ ] Có cấu hình hoặc script hỗ trợ chạy lại kiểm thử; ghi rõ
      dependency và lệnh chạy.
- [ ] Có log/report/metrics và danh sách phát hiện hoặc hành vi bất
      thường.
- [ ] Các cảnh báo được xác minh hoặc được đánh dấu rõ là chưa đủ bằng
      chứng.
- [ ] Nếu không phát hiện lỗi, báo cáo vẫn nêu rõ phạm vi đã kiểm tra,
      kết quả, giới hạn và bằng chứng tương ứng; không tuyên bố hệ thống
      hoàn toàn an toàn.
- [ ] Có tag/commit SHA, cấu hình test và hướng dẫn tái lập trên máy
      mới.
- [ ] Có lịch sử Git thể hiện đóng góp đều đặn, review chéo và peer
      evaluation.
- [ ] Tài liệu, log và ảnh đã được rà soát để không lộ thông tin nhạy
      cảm.
- [ ] Các thành viên đều nắm được tổng quan đề tài và phần mình trình
      bày.

---

## 10. Cách đánh giá đóng góp cá nhân

Để phục vụ peer-review cuối kỳ, nhóm có thể theo dõi đóng góp dựa trên
các minh chứng thực tế:

1.  Task đã nhận và kết quả bàn giao.
2.  Commit/pull request và phần review cho thành viên khác.
3.  Tài liệu, test case, script, log hoặc evidence do thành viên tạo.
4.  Mức độ chủ động giải quyết vướng mắc và hỗ trợ tích hợp.
5.  Khả năng giải thích phần việc trong buổi bảo vệ.

Không đánh giá chỉ dựa vào số lượng commit; cần xem chất lượng, độ khó,
kết quả thực tế và mức độ phối hợp.

---

## 11. Tài liệu tham khảo chính

- **Hướng dẫn thực hiện đề tài môn Kiểm thử phần mềm** -- Nguyễn Thế
  Lâm, Khoa Công nghệ Thông tin, Trường Đại học Đà Lạt (tài liệu nhóm
  cung cấp).
- **Snipe-IT repository:** https://github.com/grokability/snipe-it
- **OWASP ZAP Documentation:** https://www.zaproxy.org/docs/

---

## 12. Kết luận

Bản phân công này chia đề tài thành năm mảng có sản phẩm bàn giao cụ
thể: phân tích và môi trường; điều phối và phương pháp DAST; thiết kế
kịch bản; thực thi và phân tích kết quả; bằng chứng và tái lập. Các phần
báo cáo A--H đều có người phụ trách chính và người phối hợp để hạn chế
bỏ sót công việc.

Nhóm cần rà soát khối lượng sau mỗi Sprint, cập nhật task theo tiến độ
thực tế và bảo đảm tất cả thành viên cùng hiểu mục tiêu, phạm vi, kết
quả và giới hạn của kiểm thử DAST.
