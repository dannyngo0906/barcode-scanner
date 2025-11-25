# 🚀 Hướng dẫn Deploy lên Production (scan.salesai.vn)

## ✅ VẤN ĐỀ ĐÃ FIX

### Bug đã sửa:
- **Vấn đề**: API không trả về kết quả vì `encodeURIComponent()` encode dấu phẩy trong where clause
- **Nguyên nhân**: NocoDB v3 cần raw query `where=(barcode,eq,123)` không phải encoded `where=(barcode%2Ceq%2C123)`
- **Fix**: Removed `encodeURIComponent()` từ `server/routes.ts:49`

### Code thay đổi:
```javascript
// TRƯỚC (broken):
const where = encodeURIComponent(`(barcode,eq,${barcode})`);

// SAU (working):
const where = `(barcode,eq,${barcode})`;
```

---

## 📋 CHECKLIST DEPLOY

### 1️⃣ **Trên Server Production (scan.salesai.vn)**

#### A. Tạo/Update file `.env`

SSH vào server và tạo file `.env`:

```bash
ssh user@scan.salesai.vn
cd /var/www/vhosts/scan.salesai.vn/httpdocs

# Tạo file .env
nano .env
```

Nội dung file `.env`:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# NocoDB Configuration
NOCODB_BASE_URL=https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records
NOCODB_TOKEN=1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA

# CORS Configuration
ALLOWED_ORIGINS=https://scan.salesai.vn

# Database Configuration (Optional)
# DATABASE_URL=postgresql://user:password@host:port/database
```

**Lưu ý:**
- `NODE_ENV=production` (không phải development)
- `ALLOWED_ORIGINS=https://scan.salesai.vn` (chỉ production domain)
- `PORT=5000` hoặc port nào Plesk/hosting đang dùng

#### B. Pull code mới từ Git

```bash
git pull origin claude/review-repo-01LXg46RakKUFm6tDuDEuo4G
```

#### C. Install dependencies và build

```bash
npm install
npm run build
```

#### D. Restart app

**Nếu dùng PM2:**
```bash
pm2 restart barcode-scanner
# Hoặc
pm2 restart all
```

**Nếu dùng Plesk/hosting panel:**
- Vào Node.js settings
- Click "Restart app"

#### E. Verify environment variables

Check server logs để đảm bảo env được load đúng:

```bash
pm2 logs barcode-scanner
```

Phải thấy:
```
🔧 Environment Configuration:
   PORT: 5000
   NODE_ENV: production
   NOCODB_BASE_URL: https://db.salesai.vn/...
   NOCODB_TOKEN: ***SET***  ← Phải là SET, không phải NOT SET
   ALLOWED_ORIGINS: https://scan.salesai.vn
```

---

### 2️⃣ **Hoặc Deploy qua Plesk Panel**

#### A. Upload file .env

1. Login vào Plesk
2. Vào **File Manager**
3. Navigate to: `/var/www/vhosts/scan.salesai.vn/httpdocs/`
4. Click **+ Create File** → `.env`
5. Paste nội dung từ section 1A
6. Save

#### B. Environment Variables trong Plesk

Hoặc set trực tiếp trong Plesk Node.js settings:

1. **Websites & Domains** → **scan.salesai.vn**
2. **Node.js** settings
3. **Environment Variables**:
   ```
   NODE_ENV=production
   NOCODB_TOKEN=1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA
   NOCODB_BASE_URL=https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records
   ALLOWED_ORIGINS=https://scan.salesai.vn
   ```
4. Click **Apply**
5. **Restart App**

#### C. Deploy từ Git

Trong Plesk Git settings:
1. **Pull Updates** từ branch `claude/review-repo-01LXg46RakKUFm6tDuDEuo4G`
2. **Run deployment actions** (npm install, npm run build)
3. **Restart app**

---

## 🧪 TEST SAU KHI DEPLOY

### Test 1: Health check

```bash
curl https://scan.salesai.vn/api/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2025-11-21T..."}
```

### Test 2: API endpoint

```bash
curl "https://scan.salesai.vn/api/products/search?barcode=769915233490"
```

**Expected:**
```json
{
  "list": [{
    "barcode": "769915233490",
    "title": "...",
    ...
  }],
  "pageInfo": {...}
}
```

### Test 3: Web app

1. Mở browser: **https://scan.salesai.vn**
2. Click camera icon
3. Nhập barcode: `769915233490`
4. Phải hiện thông tin sản phẩm

---

## 🔍 TROUBLESHOOTING

### Vấn đề: "Token: NOT SET" trong logs

**Nguyên nhân:** File `.env` không được load

**Giải pháp:**
1. Check file `.env` có ở đúng thư mục không:
   ```bash
   ls -la /var/www/vhosts/scan.salesai.vn/httpdocs/.env
   ```
2. Check permissions:
   ```bash
   chmod 644 .env
   ```
3. Restart app

---

### Vấn đề: CORS error trong browser

**Triệu chứng:**
```
Access to fetch at 'https://scan.salesai.vn/api/...' from origin 'https://scan.salesai.vn' has been blocked by CORS policy
```

**Giải pháp:**
1. Check `ALLOWED_ORIGINS` có include `https://scan.salesai.vn` không
2. Check không có trailing slash: `https://scan.salesai.vn` (không phải `https://scan.salesai.vn/`)
3. Restart app sau khi update env

---

### Vấn đề: API vẫn trả về empty list

**Check:**

1. **Token có đúng không?**
   ```bash
   curl -H "xc-token: 1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA" \
     "https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records?where=(barcode,eq,769915233490)"
   ```
   Phải trả về data

2. **Server đang dùng code mới không?**
   ```bash
   # Check git commit
   git log -1 --oneline
   ```
   Phải thấy: "Fix NocoDB v3 API query..."

3. **Build có chạy không?**
   ```bash
   ls -la dist/
   ```
   Phải có file mới: `dist/index.js`

---

### Vấn đề: npm install failed

**Nếu gặp lỗi package:**

```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 FILES QUAN TRỌNG

| File | Mục đích | Deploy lên server? |
|------|----------|-------------------|
| `.env` | Config production | ✅ CẦN (tạo trên server) |
| `.env.example` | Template | ❌ Không cần |
| `server/routes.ts` | Backend API | ✅ (qua git pull) |
| `dist/` | Production build | ✅ (qua npm run build) |
| `package.json` | Dependencies | ✅ (qua git pull) |

---

## 🎯 SUMMARY

### Để app hoạt động trên scan.salesai.vn:

1. ✅ **Code đã fix** - commit `a437df4`
2. ✅ **Pull code mới** từ git
3. ✅ **Tạo file `.env`** trên server với token đúng
4. ✅ **Build**: `npm run build`
5. ✅ **Restart app**: PM2 hoặc Plesk
6. ✅ **Test**: https://scan.salesai.vn/api/health

---

## 📞 SUPPORT

Nếu vẫn gặp vấn đề, check:

1. **Server logs**:
   ```bash
   pm2 logs barcode-scanner --lines 50
   ```

2. **Browser console** (F12) khi mở app

3. **Network tab** để xem API requests

Gửi logs cho tôi để debug thêm!
