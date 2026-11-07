# Thiết lập Snipe-IT bằng Docker

> Phụ trách: Nguyễn Văn An  
> Nguồn tham chiếu: báo cáo giữa kỳ, mục 3 - Triển khai Snipe-IT bằng Docker  
> Trạng thái: đã kiểm chứng trên Windows/Docker Desktop với Snipe-IT v8.8.0

## 1. Phiên bản và môi trường

| Thành phần | Giá trị đã kiểm chứng |
|---|---|
| Hệ điều hành | Windows 11, Docker Desktop dùng Linux Containers/WSL 2 |
| Docker Engine | 29.8.0 |
| Docker Compose | v5.5.1 |
| Snipe-IT release | `v8.8.0` |
| Commit upstream | `2c466fa8a5a68525439bf1bbbc24470d6670c516` |
| Database | MariaDB 11.4.7 |
| URL local | `http://localhost:8000` |

Các giá trị chi tiết được ghi tại [`version-lock.md`](./version-lock.md). Tài khoản admin/end-user được ghi tại [`test-environment.md`](./test-environment.md).

## 2. Điều kiện

- Docker Desktop đang chạy ở chế độ Linux Containers.
- WSL 2 đã được bật.
- Đã cài Git.
- Mở PowerShell.
- Port `8000` chưa bị ứng dụng khác chiếm.

Kiểm tra:

```powershell
docker --version
docker compose version
docker info
```

## 3. Clone đúng phiên bản Snipe-IT

```powershell
git clone --branch v8.8.0 --single-branch https://github.com/grokability/snipe-it.git
cd snipe-it
git rev-parse HEAD
```

Commit phải bắt đầu bằng hoặc khớp với `2c466fa8a5a68525439bf1bbbc24470d6670c516`.

## 4. Tạo cấu hình `.env`

Trong thư mục nguồn Snipe-IT, chạy:

```powershell
if (!(Test-Path ".env")) { Copy-Item ".env.docker" ".env" }
```

Cấu hình ít nhất các dòng sau:

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
DB_PASSWORD=THAY_BANG_MAT_KHAU_MOI
MYSQL_ROOT_PASSWORD=THAY_BANG_MAT_KHAU_ROOT_MOI
```

Không dùng mật khẩu mẫu trong môi trường công khai.

Tạo `APP_KEY` mới:

```powershell
docker compose run --rm --no-deps app php artisan key:generate --show
```

Dán chuỗi kết quả bắt đầu bằng `base64:` vào `APP_KEY=` trong `.env`.

## 5. Khởi chạy

```powershell
docker compose pull
docker compose up -d
docker compose ps
docker compose logs -f
```

Mở `http://localhost:8000/setup`.
Sau khi database có thể kết nối, vào bước Pre-Flight/Migrate và hoàn tất trang **Create an Admin User** bằng thông tin tại [`test-environment.md`](./test-environment.md).

Nếu wizard không chuyển sang trang đăng nhập sau migration, chạy migration và kiểm tra lại:

```powershell
docker compose exec app php artisan migrate --force
docker compose exec app php artisan config:clear
docker compose exec app php artisan cache:clear
```

Nếu đã có tài khoản admin lỗi trùng, không tạo lại bản ghi thủ công bằng wizard. Có thể xóa bản ghi test trong cơ sở dữ liệu hoặc reset volume theo mục bên dưới.

## 6. Dữ liệu mẫu và tài khoản test

Sau khi đăng nhập Admin:

1. Vào **People > Create User** để tạo hoặc kiểm tra tài khoản End-User.
2. Vào **Import** để tải CSV dữ liệu mẫu từ thư mục `sample_csvs` của release Snipe-IT.
3. Kiểm tra tài khoản End-User không truy cập được `/users`; kết quả mong đợi là HTTP 403 hoặc redirect hợp lệ.

Thông tin đăng nhập mục tiêu được ghi tại [`test-environment.md`](./test-environment.md).

## 7. Reset môi trường sạch

Chỉ chạy khi cần khởi tạo lại toàn bộ database và dữ liệu test:

```powershell
docker compose down -v
docker compose pull
docker compose up -d
```

`down -v` xóa volume database và file lưu trữ. Sau đó chạy lại bước migration/wizard và tạo admin/end-user.

## 8. Dừng và khởi động lại

```powershell
# Dừng nhưng giữ database và dữ liệu
docker compose stop

# Khởi động lại dữ liệu hiện có
docker compose start

# Xóa container nhưng giữ volume
docker compose down
```
