# ⚡ Quick Start - Fix "Không tìm thấy sản phẩm"

## 🔴 VẤN ĐỀ

Khi nhập barcode, không ra thông tin sản phẩm vì **thiếu NocoDB token**.

## ✅ GIẢI PHÁP (3 BƯỚC)

### 1️⃣ Lấy Token từ NocoDB

**Cách nhanh nhất:**
1. Mở: https://db.salesai.vn
2. Login vào tài khoản
3. Nhấn **F12** > Tab **Application** > **Cookies**
4. Tìm cookie `xc-auth` và copy giá trị

**Hoặc:**
- Account Settings > API Tokens > Create new token

### 2️⃣ Thêm Token vào .env

Mở file `.env` (đã tạo sẵn) và sửa dòng này:

```bash
NOCODB_TOKEN=
```

Thành:

```bash
NOCODB_TOKEN=nc_paste_token_vao_day
```

**Ví dụ:**
```bash
NOCODB_TOKEN=nc_1234567890abcdefghijklmnopqrstuvwxyz
```

### 3️⃣ Restart Server

```bash
# Dừng server (Ctrl+C) và chạy lại:
npm run dev
```

## ✅ KIỂM TRA

Sau khi restart, bạn sẽ thấy log:

```
🔧 Environment Configuration:
   PORT: 5000
   NODE_ENV: development
   NOCODB_BASE_URL: https://db.salesai.vn/...
   NOCODB_TOKEN: ***SET***  ← Phải thấy "***SET***"
   ...
```

Nếu thấy `NOCODB_TOKEN: NOT SET` → Token chưa đúng.

## 🧪 TEST API

```bash
# Test với barcode mẫu (thay TOKEN bằng token thật):
node test-nocodb-api.js 8936186880060 nc_YOUR_TOKEN

# Hoặc để token trong .env:
node test-nocodb-api.js 8936186880060
```

**Kết quả mong đợi:**
```
✅ API Response Successful!
🎉 Found product(s):
   Product #1:
   - Title: Tên sản phẩm
   - Barcode: 8936186880060
   ...
```

## 📝 FILES QUAN TRỌNG

- **`.env`** ← Thêm token vào đây (đã tạo sẵn)
- **`README_TOKEN_SETUP.md`** ← Hướng dẫn chi tiết
- **`test-nocodb-api.js`** ← Script test API

## 🚨 LƯU Ý BẢO MẬT

- ✅ File `.env` đã được thêm vào `.gitignore`
- ⚠️ KHÔNG commit file `.env` lên Git
- ⚠️ KHÔNG share token publicly

## 🆘 VẪN GẶP LỖI?

### Lỗi: "Access denied"
→ Token sai hoặc hết hạn. Tạo token mới.

### Lỗi: "Token: NOT SET"
→ Kiểm tra lại file `.env`:
  - File có ở thư mục gốc không? `/home/user/barcode-scanner/.env`
  - Format có đúng không? `NOCODB_TOKEN=nc_xxx` (không có dấu ngoặc, space)

### Lỗi: "No products found"
→ API đã hoạt động! Chỉ là barcode không có trong database.
  - Thử barcode khác
  - Kiểm tra database có sản phẩm với barcode đó không

---

**Xong! App sẽ hoạt động ngay sau khi có token.** 🎉
