# 🔑 Hướng dẫn cấu hình NocoDB Token

## ⚠️ VẤN ĐỀ HIỆN TẠI

API NocoDB trả về **"Access denied"** vì thiếu token xác thực.

```bash
$ curl "https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records"
Access denied
```

## ✅ GIẢI PHÁP

### Bước 1: Lấy Token từ NocoDB

#### **Cách 1: Từ NocoDB Dashboard (Khuyến nghị)**

1. Truy cập: **https://db.salesai.vn**
2. **Login** với tài khoản của bạn
3. Click vào **avatar** (góc trên bên phải)
4. Chọn **"Account Settings"** hoặc **"Settings"**
5. Tìm tab **"API Tokens"** hoặc **"Tokens"**
6. Click **"Create new token"** nếu chưa có
7. **Copy token** (format thường là: `nc_xxxxxxxxxxxxx...`)

#### **Cách 2: Từ Browser DevTools**

1. Mở **https://db.salesai.vn** và login
2. Nhấn **F12** để mở DevTools
3. Vào tab **"Application"** (Chrome) hoặc **"Storage"** (Firefox)
4. Chọn **"Cookies"** > **`https://db.salesai.vn`**
5. Tìm cookie tên **`xc-auth`** hoặc **`nc_auth`**
6. Copy giá trị trong cột **"Value"**

#### **Cách 3: Từ Network Request**

1. Mở **https://db.salesai.vn** và login
2. Nhấn **F12** > Tab **"Network"**
3. Reload trang hoặc click vào table bất kỳ
4. Tìm request có URL chứa `/api/v2/`
5. Click vào request đó > Tab **"Headers"**
6. Tìm trong **"Request Headers"** dòng **`xc-token: ...`**
7. Copy giá trị sau `xc-token:`

---

### Bước 2: Cấu hình Token

#### **A. Cho Development (Local)**

Mở file **`.env`** trong thư mục gốc project và thêm token:

```bash
# .env
NOCODB_TOKEN=nc_your_actual_token_here_xxxxxxxxxxxxxxxxx
```

**Ví dụ:**
```bash
NOCODB_TOKEN=nc_1234567890abcdefghijklmnopqrstuvwxyz
```

#### **B. Cho Production (scan.salesai.vn)**

##### **Option 1: Qua Plesk Panel**

1. Login vào **Plesk** của `scan.salesai.vn`
2. Vào **"Websites & Domains"** > chọn **scan.salesai.vn**
3. Tìm **"Node.js"** settings
4. Thêm **Environment Variable**:
   - Name: `NOCODB_TOKEN`
   - Value: `nc_your_actual_token`
5. Click **"Apply"** hoặc **"Restart App"**

##### **Option 2: Qua SSH**

```bash
# SSH vào server
ssh user@scan.salesai.vn

# Tạo file .env
cd /var/www/vhosts/scan.salesai.vn/httpdocs
nano .env

# Thêm nội dung:
NOCODB_TOKEN=nc_your_actual_token
ALLOWED_ORIGINS=https://scan.salesai.vn
NODE_ENV=production

# Save và restart app
pm2 restart barcode-scanner
```

---

### Bước 3: Kiểm tra Token

#### **Test Token với script:**

```bash
# Thay YOUR_TOKEN bằng token thật
node test-nocodb-api.js 8936186880060 nc_YOUR_TOKEN
```

**Kết quả mong đợi:**
```
✅ API Response Successful!
📦 Data: {...}
🎉 Found product(s):
   Product #1:
   - Title: Tên sản phẩm
   - Barcode: 8936186880060
   ...
```

#### **Test với curl:**

```bash
curl -H "xc-token: nc_YOUR_TOKEN" \
  "https://db.salesai.vn/api/v2/tables/m3rrbw0dbrlqogw/records?offset=0&limit=1"
```

**Nếu thành công, bạn sẽ thấy JSON response thay vì "Access denied"**

---

### Bước 4: Restart Server

#### **Development:**
```bash
# Stop server (Ctrl+C) và chạy lại:
npm run dev
```

#### **Production:**
```bash
# SSH vào server và restart:
pm2 restart barcode-scanner

# Hoặc restart từ Plesk panel
```

---

## 🔍 Troubleshooting

### Vấn đề: Vẫn báo "Access denied" sau khi thêm token

**Kiểm tra:**

1. ✅ Token có đúng format không? (phải bắt đầu bằng `nc_`)
2. ✅ Token có hết hạn không? (tạo token mới nếu cần)
3. ✅ File `.env` có ở đúng thư mục gốc không?
4. ✅ Đã restart server chưa?
5. ✅ Check server logs:
   ```bash
   # Development
   npm run dev
   # Xem dòng: "NOCODB_TOKEN: ***SET***"

   # Production
   pm2 logs barcode-scanner
   ```

### Vấn đề: Token bị lộ trong client

**Đừng lo!** Với implementation hiện tại:
- ✅ Token KHÔNG bao giờ gửi đến client
- ✅ Token chỉ tồn tại trên server
- ✅ Client gọi `/api/products/search` → server gọi NocoDB với token

### Vấn đề: Không tìm thấy sản phẩm

**Kiểm tra:**
1. Barcode có đúng trong database không?
2. Table ID có đúng không? `m3rrbw0dbrlqogw`
3. Field name có đúng là `barcode` không?

---

## 📋 Quick Reference

### File locations:
- **Local .env**: `/home/user/barcode-scanner/.env`
- **Production .env**: `/var/www/vhosts/scan.salesai.vn/httpdocs/.env`

### Environment Variables cần thiết:
```bash
NOCODB_TOKEN=nc_xxxxxxxxxxxxx      # BẮT BUỘC
NOCODB_BASE_URL=https://...        # Optional (có default)
ALLOWED_ORIGINS=https://...        # Optional (có default)
NODE_ENV=production                # Optional
PORT=5000                          # Optional
```

### Lệnh hữu ích:
```bash
# Test API
node test-nocodb-api.js [barcode] [token]

# Check TypeScript
npm run check

# Build production
npm run build

# Start production
npm start

# Development
npm run dev
```

---

## 🆘 Cần hỗ trợ?

Nếu vẫn gặp vấn đề, gửi cho tôi:
1. Token (phần cuối 8 ký tự thôi, ví dụ: `***xxx12345`)
2. Barcode bạn đang test
3. Error logs từ server
4. Screenshot nếu có

---

**Lưu ý bảo mật:**
- ⚠️ KHÔNG commit file `.env` vào Git
- ⚠️ KHÔNG share token publicly
- ⚠️ Regenerate token nếu bị lộ
- ✅ File `.env` đã được thêm vào `.gitignore`
