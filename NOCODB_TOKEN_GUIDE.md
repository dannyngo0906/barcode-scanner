# 🔑 Hướng dẫn lấy NocoDB Token đúng cách

## ❌ VẤN ĐỀ HIỆN TẠI

Token hiện tại bị **403 Access Denied** vì:
- Token không có quyền truy cập base `pc6dn5x2psu1vsz`
- Hoặc token bị revoke/expire
- Hoặc token được tạo từ sai workspace/base

---

## ✅ CÁCH LẤY TOKEN ĐÚNG (3 PHƯƠNG PHÁP)

### **PHƯƠNG PHÁP 1: Từ Base Settings (Khuyến nghị nhất)**

1. **Login** vào: https://db.salesai.vn

2. **Tìm và mở base** có ID: `pc6dn5x2psu1vsz`
   - Trong dashboard, tìm base này trong danh sách
   - Click vào base để mở

3. **Vào Settings của BASE** (không phải Account):
   - Click icon **⚙️** (Settings) ở góc trên bên phải
   - Hoặc click **3 chấm ⋮** → **"Settings"**

4. Trong menu Settings, chọn tab **"API Tokens"** hoặc **"Tokens"**

5. Click **"Create new token"** hoặc **"+ New Token"**

6. Điền thông tin:
   - **Name**: `Barcode Scanner API`
   - **Description**: `Token for production barcode app`
   - **Permissions**: Chọn **"Viewer"** (READ only) hoặc **"Editor"**
   - **Scope**: Nên để mặc định (entire base)

7. Click **"Create"** hoặc **"Generate"**

8. **COPY TOKEN NGAY** (chỉ hiện 1 lần!)
   - Token sẽ có dạng: `nc_xxxxxxxxxxxxxxxxxxxx`
   - Hoặc dạng JWT: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

9. **Paste vào file `.env`** dòng 9:
   ```bash
   NOCODB_TOKEN=token_vua_copy
   ```

---

### **PHƯƠNG PHÁP 2: Từ Account Settings**

**Lưu ý:** Cách này phức tạp hơn vì cần grant permissions cho từng base.

1. Login vào https://db.salesai.vn

2. Click **Avatar** (góc trên phải) → **"Account Settings"**

3. Tab **"API Tokens"** hoặc **"Tokens"**

4. Click **"Create new token"**

5. Điền thông tin:
   - **Name**: `Barcode Scanner`
   - **Base Access**:
     - Nếu có dropdown, chọn base `pc6dn5x2psu1vsz`
     - Nếu không có, token sẽ cần grant permissions sau
   - **Role**: Chọn **"Viewer"** hoặc **"Editor"**

6. Sau khi tạo:
   - Nếu token không tự động có quyền
   - Vào base settings → "Collaborators" → Add token với role phù hợp

---

### **PHƯƠNG PHÁP 3: Lấy từ Browser (Temporary - chỉ để test)**

**Cảnh báo:** Token này sẽ expire khi logout!

1. Login vào https://db.salesai.vn

2. Nhấn **F12** → Tab **"Console"**

3. Chạy code này để lấy session token:

```javascript
// Copy toàn bộ đoạn này vào Console
(function() {
  // Try localStorage first
  let token = localStorage.getItem('nc_token');

  // Try cookies if not in localStorage
  if (!token) {
    let cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      let trimmed = cookie.trim();
      if (trimmed.startsWith('xc-auth=')) {
        token = trimmed.substring(8);
        break;
      }
    }
  }

  // Try sessionStorage
  if (!token) {
    token = sessionStorage.getItem('nc_token');
  }

  if (token) {
    console.log('%c✅ Token found!', 'color: green; font-size: 16px; font-weight: bold');
    console.log('%cToken:', 'color: blue; font-weight: bold', token);
    console.log('');
    console.log('%cCopy this token to .env file:', 'color: orange; font-weight: bold');
    console.log('NOCODB_TOKEN=' + token);

    // Auto copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(token).then(() => {
        console.log('%c✅ Token copied to clipboard!', 'color: green; font-weight: bold');
      });
    }
  } else {
    console.log('%c❌ Token not found!', 'color: red; font-size: 16px; font-weight: bold');
    console.log('Please try:');
    console.log('1. Check if you are logged in');
    console.log('2. Create token from Account Settings > API Tokens');
  }
})();
```

4. Token sẽ được copy vào clipboard tự động

**Lưu ý:** Token này có thể expire khi logout!

---

## 🧪 TEST TOKEN

Sau khi có token mới, test ngay:

```bash
# Test với token mới
./test-nocodb-v3.sh nc_YOUR_NEW_TOKEN

# Hoặc test với barcode cụ thể
./test-nocodb-v3.sh nc_YOUR_NEW_TOKEN 769915233490
```

**Kết quả mong đợi:**
```
📋 Test 1: GET all records (limit 1)
Status: 200
✅ SUCCESS!
{"list":[{...}],"pageInfo":{...}}
```

**Nếu vẫn 403:**
```
Status: 403
❌ FAILED
Access denied
```
→ Token vẫn không có quyền, thử lại với phương pháp khác

---

## 🔍 KIỂM TRA QUYỀN CỦA TOKEN

### Xác nhận token có quyền:

1. **Vào base settings** → **"Collaborators"** hoặc **"Team & Settings"**

2. Kiểm tra danh sách users/tokens:
   - Token của bạn phải có trong list
   - Role phải là **"Viewer"** trở lên (không phải "No Access")

3. Nếu không thấy token:
   - Token không có quyền trên base này
   - Cần add token vào base hoặc tạo token mới từ base

---

## ❓ TROUBLESHOOTING

### Q: Token có format gì?

**A:** Có 2 dạng:
- **Short token** (Base token): `nc_1234567890abcdefghijklmnopqrstuvwxyz`
- **JWT token** (Session/Account): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Cả 2 đều OK, nhưng **Base token ổn định hơn**.

---

### Q: Làm sao biết token đang có quyền gì?

**A:** Test bằng curl:

```bash
# Thay YOUR_TOKEN bằng token thật
curl -H "xc-token: YOUR_TOKEN" \
  "https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records?limit=1"
```

- **200 + JSON data** → Token OK ✅
- **403 Access denied** → Token không có quyền ❌
- **401 Unauthorized** → Token invalid/expired ❌

---

### Q: Có thể dùng multiple tokens không?

**A:** Có! Trong file `.env` bạn chỉ cần 1 token. Nhưng trong NocoDB bạn có thể tạo nhiều tokens khác nhau cho các mục đích khác nhau.

---

### Q: Token có expire không?

**A:**
- **Base tokens**: Không expire (trừ khi revoke)
- **Session tokens**: Expire khi logout
- **Account tokens**: Tùy cấu hình (thường không expire)

---

### Q: Tôi không thấy "API Tokens" trong Settings?

**A:** Có thể:
1. Bạn không có quyền admin/owner trên base
2. NocoDB version cũ không có tính năng này
3. Tính năng bị tắt bởi admin

→ Liên hệ admin để được grant API access

---

## 📋 CHECKLIST

Sau khi tạo token mới:

- [ ] Token được tạo từ **BASE settings** (không phải Account)
- [ ] Token có **Viewer** hoặc **Editor** role
- [ ] Token có quyền trên base `pc6dn5x2psu1vsz`
- [ ] Đã copy token và paste vào `.env` dòng 9
- [ ] Test với `./test-nocodb-v3.sh` → Status **200** ✅
- [ ] Restart server: `npm run dev`
- [ ] App tìm được sản phẩm khi scan barcode ✅

---

## 🎯 NEXT STEPS

1. **Tạo token mới** theo phương pháp 1
2. **Update `.env`** file
3. **Test token**: `./test-nocodb-v3.sh NEW_TOKEN`
4. **Nếu 200 OK** → Restart server: `npm run dev`
5. **Nếu vẫn 403** → Kiểm tra permissions trong base settings

---

**Token hiện tại đang dùng:**
```
1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA
```
→ ❌ **KHÔNG hoạt động** (403 Access denied)

**Cần:** Tạo token mới với đúng permissions!
