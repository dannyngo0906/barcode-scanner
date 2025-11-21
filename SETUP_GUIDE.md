# Hướng dẫn lấy NocoDB Token

## Cách 1: Lấy từ NocoDB Dashboard

1. **Login vào NocoDB**: https://db.salesai.vn
2. **Vào Account Settings** (góc trên bên phải, click vào avatar)
3. **Chọn "API Tokens"** hoặc "Tokens"
4. **Click "Create new token"** hoặc copy token có sẵn
5. **Copy token** (format: `nc_xxx...`)

## Cách 2: Lấy từ Browser DevTools (nếu bạn đã login)

1. Mở NocoDB trong browser: https://db.salesai.vn
2. Nhấn **F12** để mở DevTools
3. Vào tab **Application** > **Cookies** > `db.salesai.vn`
4. Tìm cookie tên **`xc-auth`** hoặc trong **Local Storage** tìm `nc_token`
5. Copy giá trị

## Cách 3: Check request headers (khi đã login)

1. Mở NocoDB: https://db.salesai.vn
2. Nhấn **F12** > Tab **Network**
3. Reload trang hoặc click vào bảng nào đó
4. Tìm request đến `/api/v2/...`
5. Click vào request đó > Tab **Headers**
6. Tìm header **`xc-token`** hoặc **`xc-auth`**
7. Copy giá trị

---

## Sau khi có Token, làm gì tiếp?

Tạo file `.env` trong thư mục gốc của project với nội dung:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# NocoDB Configuration
NOCODB_BASE_URL=https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records
NOCODB_TOKEN=nc_YOUR_ACTUAL_TOKEN_HERE

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5173,https://scan.salesai.vn

# Database Configuration (Optional)
# DATABASE_URL=postgresql://user:password@host:port/database
```

**Lưu ý:**
- Thay `nc_YOUR_ACTUAL_TOKEN_HERE` bằng token thật
- KHÔNG commit file `.env` vào Git (đã có trong .gitignore)
- Trên production server, set environment variables trong hosting panel
