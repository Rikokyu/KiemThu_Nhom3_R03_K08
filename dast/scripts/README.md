# Script/harness DAST

Đặt script chạy lặp lại tại đây. Mỗi script cần nêu prerequisite/version, shell, thư mục chạy, tham số (target phải là local đã phê duyệt), đầu ra, exit code và cách kiểm tra kết quả. Ghi lệnh chính xác đã thử trong `docs/dast-runbook.md`.

Chưa có script được kiểm chứng trong bộ khung ban đầu. Không thêm lệnh quét active hoặc mặc định target tới khi đã có xác nhận scope, tài khoản thử nghiệm và cách reset môi trường. Không nhúng secret vào mã nguồn/command line.
