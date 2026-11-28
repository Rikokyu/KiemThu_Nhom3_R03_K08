# Cài đặt Snipe-IT bằng Docker Compose

> **Môi trường đã ghi nhận:** Windows 11, Docker Desktop/Linux Containers,
> WSL 2; Snipe-IT `v8.8.0`, MariaDB 11.4.7, `http://localhost:8000`.
> Thông tin phiên bản chi tiết tại [version-lock.md](version-lock.md).

Repository bài tập không chứa source Snipe-IT hoặc Compose file. Các bước dưới
đây chạy trong bản clone riêng của upstream đã khóa tag/SHA, không chạy từ
thư mục repository bài tập.

## 1. Điều kiện

- Docker Desktop đang chạy với Linux Containers và WSL 2.
- Git đã cài; PowerShell được dùng cho các lệnh bên dưới.
- Port `8000` chưa được ứng dụng khác sử dụng.

Kiểm tra phiên bản công cụ:

```powershell
docker --version
docker compose version
docker info
```

Giá trị Docker/Compose đã ghi nhận trong lần dựng trước là Engine `29.8.0`
và Compose `v5.5.1`; đây là thông tin môi trường đã ghi, không phải yêu cầu
cứng để tự nâng cấp máy.

## 2. Lấy đúng bản Snipe-IT

```powershell
git clone --branch v8.8.0 --single-branch https://github.com/grokability/snipe-it.git
Set-Location snipe-it
git rev-parse HEAD
```

Đối chiếu SHA với [version-lock.md](version-lock.md). Không dùng `main` hoặc
tag khác để tái lập kết quả của phiên bản đã khóa.

## 3. Tạo cấu hình riêng cho lab mới

Trong thư mục source Snipe-IT:

```powershell
if (!(Test-Path ".env")) { Copy-Item ".env.docker" ".env" }
```

Điền các biến cần thiết trong `.env` local. Không commit file này và không
dùng mật khẩu minh họa trong môi trường dùng chung/công khai:

```dotenv
APP_VERSION=v8.8.0
APP_PORT=8000
APP_ENV=production
APP_DEBUG=false
APP_URL=http://localhost:8000
APP_TIMEZONE=Asia/Ho_Chi_Minh
DB_CONNECTION=mariadb
DB_HOST=db
DB_PORT=3306
DB_DATABASE=snipeit
DB_USERNAME=snipeit
DB_PASSWORD=<đặt-mật-khẩu-riêng>
MYSQL_ROOT_PASSWORD=<đặt-mật-khẩu-root-riêng>
```

Tạo `APP_KEY` theo quy trình của release đã checkout, rồi lưu giá trị chỉ
trong `.env` local:

```powershell
docker compose run --rm --no-deps app php artisan key:generate --show
```

Không sao chép hoặc gửi giá trị `APP_KEY`, password hoặc nội dung `.env`.

## 4. Khởi chạy và kiểm tra

```powershell
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f
```

Mở `http://localhost:8000/setup` và hoàn thành trình cài đặt chỉ cho database
lab mới. Nếu release/Compose file yêu cầu migration sau khi cấu hình xong, các
lệnh sau tác động lên database đang chạy; chỉ dùng khi đã xác nhận đúng target:

```powershell
docker compose exec app php artisan migrate --force
docker compose exec app php artisan config:clear
docker compose exec app php artisan cache:clear
```

Không chạy các lệnh trên để khắc phục lỗi nếu chưa biết rõ đang kết nối tới
database nào. Không import sample data vào instance có dữ liệu cần giữ.

## 5. Tài khoản và dữ liệu cho DAST

Tạo tài khoản lab và dữ liệu giả lập theo
[test-environment.md](test-environment.md). Không dùng tài khoản, dữ liệu cá
nhân hoặc database của môi trường thật. Trước khi active scan, xác nhận target,
scope và phương án khôi phục.

Automation Playwright có `.env` riêng trong `automation/`; cách cấu hình và
chạy nằm tại [automation/README.md](../automation/README.md). Đây là dữ liệu
kiểm thử riêng của Playwright, không yêu cầu import mẫu hay reset database.

## 6. Dừng/khởi động lại thông thường

Các lệnh sau không yêu cầu xóa volume:

```powershell
docker compose stop
docker compose start
docker compose down
```

`docker compose down` dừng/xóa container và network của project; mặc định giữ
volume dữ liệu. Kiểm tra Compose project/volume trước khi thao tác nếu máy có
nhiều instance.

## 7. Reset một lab dùng một lần — thao tác phá hủy

> **CẢNH BÁO:** `docker compose down -v` xóa volume gắn với Compose project,
> bao gồm database và các tệp được lưu trong volume. Dữ liệu không thể khôi
> phục nếu chưa có backup. Không dùng lệnh này cho lỗi thông thường, instance
> đang dùng chung, hoặc môi trường có dữ liệu cần giữ.

Chỉ thực hiện reset khi chủ sở hữu đã xác nhận instance này là lab bỏ được,
đã xác định đúng thư mục/Compose project, và dữ liệu có thể bị xóa. Sao lưu
trước nếu cần giữ lại. Lệnh sau **không được chạy trong lượt chỉnh tài liệu
này**:

```powershell
docker compose down -v
```

Sau reset, việc khởi tạo lại sẽ cần cấu hình `.env`, chạy setup/migration và
tạo dữ liệu lab mới. Không dùng reset để làm sạch dữ liệu của test automation;
Playwright có cleanup theo manifest và không reset database.
