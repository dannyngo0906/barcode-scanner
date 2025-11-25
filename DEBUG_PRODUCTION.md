# 🔍 DEBUG CHECKLIST - scan.salesai.vn không tìm được sản phẩm

## ❓ VẤN ĐỀ

Barcode `769915233490` không tìm thấy sản phẩm trên https://scan.salesai.vn/

---

## ✅ CHECKLIST DEBUG (Theo thứ tự)

### 1️⃣ **Kiểm tra Server đã deploy code mới chưa?**

SSH vào server và chạy:

```bash
ssh user@scan.salesai.vn
cd /var/www/vhosts/scan.salesai.vn/httpdocs

# Check git commit hiện tại
git log -1 --oneline
```

**Phải thấy:**
```
a437df4 Fix NocoDB v3 API query - remove URI encoding from where clause
```

**Nếu KHÔNG thấy commit này:**
```bash
# Pull code mới
git pull origin claude/review-repo-01LXg46RakKUFm6tDuDEuo4G

# Build lại
npm install
npm run build

# Restart
pm2 restart barcode-scanner
```

---

### 2️⃣ **Kiểm tra file .env có đúng không?**

```bash
cat .env
```

**Phải thấy:**
```bash
NODE_ENV=production
NOCODB_TOKEN=1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA
NOCODB_BASE_URL=https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records
ALLOWED_ORIGINS=https://scan.salesai.vn
```

**Nếu file không tồn tại hoặc sai:**
```bash
nano .env
# Paste config từ trên
# Ctrl+X, Y, Enter để save

# Restart
pm2 restart barcode-scanner
```

---

### 3️⃣ **Kiểm tra server logs**

```bash
# Check logs
pm2 logs barcode-scanner --lines 50

# Hoặc
tail -f /var/log/nodejs/barcode-scanner.log
```

**Tìm kiếm:**

✅ **Logs tốt:**
```
🔧 Environment Configuration:
   NOCODB_TOKEN: ***SET***
   NOCODB_BASE_URL: https://db.salesai.vn/...
   ALLOWED_ORIGINS: https://scan.salesai.vn
serving on port 5000
```

❌ **Logs lỗi:**
```
NOCODB_TOKEN: NOT SET  ← File .env không load
Error: Cannot find module  ← Build chưa chạy
ECONNREFUSED             ← Không kết nối được NocoDB
```

---

### 4️⃣ **Test API endpoint trực tiếp từ server**

Từ server, chạy:

```bash
# Test 1: Health check
curl http://localhost:5000/api/health

# Expected: {"status":"ok","timestamp":"..."}
```

```bash
# Test 2: Product search
curl "http://localhost:5000/api/products/search?barcode=769915233490"

# Expected: {"list":[{...}],"pageInfo":{...}}
```

**Nếu Test 2 trả về:**

✅ **Có data** → Server OK, vấn đề ở CORS hoặc frontend
```json
{"list":[{"barcode":"769915233490","title":"..."}]}
```

❌ **Empty list** → NocoDB query sai hoặc không có sản phẩm
```json
{"list":[],"pageInfo":{...}}
```

❌ **Error** → Check error message
```json
{"error":"Database query failed: ..."}
```

---

### 5️⃣ **Test NocoDB API trực tiếp**

Từ server hoặc local machine:

```bash
# Test NocoDB API trực tiếp với where clause
curl -H "xc-token: 1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA" \
  "https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records?where=(barcode,eq,769915233490)"
```

**Expected:**
```json
{"list":[{...}],"pageInfo":{...}}
```

**Nếu trả về empty list `[]`:**
→ Sản phẩm với barcode `769915233490` KHÔNG CÓ trong database!

---

### 6️⃣ **Kiểm tra Browser Console (Client-side)**

Mở https://scan.salesai.vn/ trong browser:

1. Nhấn **F12** → Tab **Console**
2. Nhập barcode: `769915233490`
3. Xem có lỗi gì không

**Lỗi thường gặp:**

❌ **CORS Error:**
```
Access to fetch at 'https://scan.salesai.vn/api/...' has been blocked by CORS policy
```
→ Check `ALLOWED_ORIGINS` trong .env
→ Restart server

❌ **404 Not Found:**
```
GET https://scan.salesai.vn/api/products/search?barcode=... 404
```
→ Server chưa start hoặc route không đúng

❌ **500 Internal Server Error:**
```
GET https://scan.salesai.vn/api/products/search?barcode=... 500
```
→ Check server logs để xem error gì

---

### 7️⃣ **Kiểm tra Network Tab**

Trong Browser DevTools:

1. **F12** → Tab **Network**
2. Nhập barcode
3. Tìm request đến `/api/products/search`
4. Click vào request đó

**Check:**

**Request Headers:**
```
GET /api/products/search?barcode=769915233490
Host: scan.salesai.vn
Origin: https://scan.salesai.vn
```

**Response Headers:**
```
Access-Control-Allow-Origin: https://scan.salesai.vn  ← Phải có
Content-Type: application/json
```

**Response Body:**
```json
{"list":[...],"pageInfo":{...}}
```

Nếu `list: []` → Không có sản phẩm trong DB
Nếu `error: "..."` → Copy error message

---

### 8️⃣ **Verify barcode có trong database không?**

Login vào NocoDB:

1. Vào https://db.salesai.vn
2. Mở base `pc6dn5x2psu1vsz`
3. Mở table `m3rrbw0dbrlqogw`
4. **Tìm kiếm** hoặc **filter** với barcode: `769915233490`

**Nếu KHÔNG tìm thấy:**
→ Đây là vấn đề! Sản phẩm không có trong database
→ Cần import/add sản phẩm này vào NocoDB

**Nếu TÌM THẤY:**
→ Có sản phẩm trong DB, vấn đề là ở API query hoặc code

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: Server chưa deploy code mới

**Symptoms:**
- API vẫn trả về empty results
- Git log không có commit `a437df4`

**Fix:**
```bash
git pull origin claude/review-repo-01LXg46RakKUFm6tDuDEuo4G
npm run build
pm2 restart barcode-scanner
```

---

### Issue 2: File .env không được load

**Symptoms:**
- Server logs hiện `NOCODB_TOKEN: NOT SET`
- API returns 403/401

**Fix:**
```bash
# Tạo file .env
nano .env
# Paste config
# Save và restart
pm2 restart barcode-scanner
```

---

### Issue 3: CORS blocking

**Symptoms:**
- Browser console: "blocked by CORS policy"
- API calls từ server work, nhưng từ browser fail

**Fix:**
```bash
# Check .env
cat .env | grep ALLOWED_ORIGINS

# Phải là:
ALLOWED_ORIGINS=https://scan.salesai.vn

# Nếu sai, sửa lại và restart
pm2 restart barcode-scanner
```

---

### Issue 4: Barcode không có trong database

**Symptoms:**
- API trả về `{"list":[],...}`
- NocoDB không tìm thấy record với barcode đó

**Fix:**
- Add sản phẩm vào NocoDB
- Hoặc test với barcode khác có trong DB

---

### Issue 5: Build không chạy

**Symptoms:**
- Code thay đổi nhưng behavior vẫn cũ
- `dist/` folder không update

**Fix:**
```bash
# Clear dist và build lại
rm -rf dist
npm run build

# Check dist/index.js có mới không
ls -la dist/index.js

# Restart
pm2 restart barcode-scanner
```

---

## 📋 QUICK DEBUG COMMANDS

Chạy tất cả lệnh này trên server:

```bash
# 1. Check git
git log -1 --oneline

# 2. Check .env
cat .env | grep -E "NOCODB_TOKEN|NOCODB_BASE_URL|ALLOWED_ORIGINS"

# 3. Check server running
pm2 list

# 4. Check logs
pm2 logs barcode-scanner --lines 30

# 5. Test local API
curl "http://localhost:5000/api/health"
curl "http://localhost:5000/api/products/search?barcode=769915233490"

# 6. Test NocoDB directly
curl -H "xc-token: 1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA" \
  "https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records?where=(barcode,eq,769915233490)"
```

---

## 💡 MOST LIKELY ISSUES

Dựa trên thông tin, các vấn đề có thể xảy ra theo thứ tự:

1. **Server chưa deploy code mới** (70% khả năng)
   - Git pull chưa chạy
   - Build chưa chạy
   - Server chưa restart

2. **Barcode không có trong database** (20% khả năng)
   - Product với barcode `769915233490` không tồn tại
   - Cần verify trong NocoDB

3. **Environment variables sai** (10% khả năng)
   - File .env chưa tạo
   - Token sai
   - CORS config sai

---

## 🆘 NEXT STEPS

Hãy chạy các lệnh debug ở trên và gửi cho tôi:

1. **Output của:**
   ```bash
   git log -1 --oneline
   pm2 logs barcode-scanner --lines 30
   curl "http://localhost:5000/api/products/search?barcode=769915233490"
   ```

2. **Screenshot** Browser Console khi search barcode

3. **Screenshot** Network tab showing API request/response

Với thông tin đó tôi sẽ giúp bạn fix chính xác!
