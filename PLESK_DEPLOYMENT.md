# 🚀 Hướng dẫn Deploy lên Plesk (scan.salesai.vn)

## 📋 YÊU CẦU

- ✅ Plesk Panel access
- ✅ Domain: `scan.salesai.vn` đã setup
- ✅ Git repository: `dannyngo0906/barcode-scanner`
- ✅ Node.js 18+ support

---

## 🎯 TỔNG QUAN DEPLOYMENT

1. **Setup Git Deployment** trong Plesk
2. **Configure Node.js Application**
3. **Set Environment Variables**
4. **Configure Build & Start Scripts**
5. **Deploy & Test**

---

## 📝 BƯỚC 1: LOGIN VÀO PLESK

1. Truy cập: `https://plesk.salesai.vn:8443` (hoặc URL Plesk của bạn)
2. Login với credentials
3. Chọn domain: **scan.salesai.vn**

---

## 🔧 BƯỚC 2: SETUP GIT DEPLOYMENT

### 2.1. Vào Git Settings

1. Trong domain `scan.salesai.vn`, tìm section **"Git"**
2. Click **"Add Repository"** (hoặc **"Enable Git"**)

### 2.2. Configure Git Repository

**Repository URL:**
```
https://github.com/dannyngo0906/barcode-scanner.git
```

**Branch:**
```
claude/review-repo-01LXg46RakKUFm6tDuDEuo4G
```

**Repository Path:**
```
/httpdocs
```
Hoặc
```
/
```

**Deploy to:**
```
Document Root (/httpdocs)
```

### 2.3. Authentication

Nếu repository là private:

1. Click **"Generate Keys"** để tạo SSH key
2. Copy SSH public key
3. Vào GitHub → Settings → Deploy keys → Add deploy key
4. Paste public key và save

Hoặc dùng HTTPS với Personal Access Token:

**Repository URL:**
```
https://YOUR_GITHUB_TOKEN@github.com/dannyngo0906/barcode-scanner.git
```

### 2.4. Configure Deployment Actions

Trong **"Additional Deployment Actions"** (hoặc **"Actions"**), thêm:

**Install dependencies:**
```bash
npm install --production
```

**Build application:**
```bash
npm run build
```

**Restart application:**
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
pm2 restart barcode-scanner || pm2 start npm --name "barcode-scanner" -- start
```

**Full deployment script:**
```bash
#!/bin/bash
set -e

echo "Installing dependencies..."
npm install --production

echo "Building application..."
npm run build

echo "Restarting application..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Restart or start app
if pm2 list | grep -q "barcode-scanner"; then
    echo "Restarting existing app..."
    pm2 restart barcode-scanner
else
    echo "Starting new app..."
    pm2 start npm --name "barcode-scanner" -- start
    pm2 save
fi

echo "Deployment complete!"
```

**Save** Git settings

---

## 🖥️ BƯỚC 3: CONFIGURE NODE.JS APPLICATION

### 3.1. Enable Node.js

1. Trong domain `scan.salesai.vn`, tìm **"Node.js"**
2. Click **"Enable Node.js"**

### 3.2. Node.js Settings

**Node.js version:**
```
18.x.x (hoặc 20.x.x nếu có)
```

**Application mode:**
```
Production
```

**Application root:**
```
/httpdocs
```
(hoặc path nơi bạn deploy code)

**Application URL:**
```
https://scan.salesai.vn
```

**Application startup file:**
```
dist/index.js
```

**Custom startup command (nếu có option):**
```bash
node dist/index.js
```

**Hoặc dùng PM2:**
```bash
pm2 start dist/index.js --name barcode-scanner
```

---

## 🔐 BƯỚC 4: CONFIGURE ENVIRONMENT VARIABLES

### 4.1. Trong Node.js Settings

Tìm section **"Environment Variables"** và thêm:

| Variable Name | Value |
|--------------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` (hoặc port Plesk assign) |
| `NOCODB_BASE_URL` | `https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records` |
| `NOCODB_TOKEN` | `1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA` |
| `ALLOWED_ORIGINS` | `https://scan.salesai.vn` |

Click **"Apply"** sau khi thêm xong.

### 4.2. Hoặc tạo file .env qua File Manager

1. Vào **"File Manager"**
2. Navigate to `/httpdocs`
3. Click **"+ Create File"** → `.env`
4. Edit file với nội dung:

```bash
NODE_ENV=production
PORT=5000
NOCODB_BASE_URL=https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records
NOCODB_TOKEN=1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA
ALLOWED_ORIGINS=https://scan.salesai.vn
```

5. **Save** file
6. **Set permissions**: `644` (rw-r--r--)

---

## 🌐 BƯỚC 5: CONFIGURE REVERSE PROXY (Nếu cần)

Nếu app chạy trên port khác (ví dụ 5000) và cần proxy qua port 80/443:

### 5.1. Apache Configuration

Vào **"Apache & nginx Settings"**

**Additional nginx directives:**
```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location / {
    try_files $uri $uri/ @nodejs;
}

location @nodejs {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

**Additional Apache directives:**
```apache
ProxyPass /api http://127.0.0.1:5000/api
ProxyPassReverse /api http://127.0.0.1:5000/api

ProxyPass / http://127.0.0.1:5000/
ProxyPassReverse / http://127.0.0.1:5000/

ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"
RequestHeader set X-Forwarded-Port "443"
```

Click **"OK"** và **"Apply"**

---

## 🔒 BƯỚC 6: SETUP SSL/HTTPS

### 6.1. Enable SSL

1. Vào **"SSL/TLS Certificates"**
2. Nếu chưa có certificate:
   - Chọn **"Let's Encrypt"**
   - Check **"scan.salesai.vn"** và **"www.scan.salesai.vn"**
   - Click **"Get it free"**
   - Đợi certificate được issue

### 6.2. Force HTTPS

1. Vào **"Hosting Settings"**
2. Check **"Permanent SEO-safe 301 redirect from HTTP to HTTPS"**
3. Click **"OK"**

---

## 🚀 BƯỚC 7: DEPLOY APPLICATION

### 7.1. Pull Code từ Git

1. Vào **"Git"** section
2. Click **"Pull Updates"** hoặc **"Deploy"**
3. Chọn branch: `claude/review-repo-01LXg46RakKUFm6tDuDEuo4G`
4. Click **"Deploy"**

Plesk sẽ:
- Pull code từ GitHub
- Run `npm install`
- Run `npm run build`
- Restart application

### 7.2. Monitor Deployment

Xem **"Deployment logs"** để check:
```
✓ npm install complete
✓ Build successful
✓ Application restarted
```

---

## 📊 BƯỚC 8: START APPLICATION

### 8.1. Nếu dùng Plesk Node.js Manager

1. Vào **"Node.js"** settings
2. Click **"Restart App"** hoặc **"Enable Application"**
3. Status phải là **"Running"**

### 8.2. Nếu dùng PM2 qua SSH

```bash
# SSH vào server
ssh user@scan.salesai.vn

# Navigate to app directory
cd /var/www/vhosts/scan.salesai.vn/httpdocs

# Start with PM2
pm2 start dist/index.js --name barcode-scanner

# Save PM2 process list
pm2 save

# Setup PM2 startup script
pm2 startup

# Check status
pm2 status
```

---

## ✅ BƯỚC 9: VERIFY DEPLOYMENT

### 9.1. Test Health Endpoint

```bash
curl https://scan.salesai.vn/api/health
```

**Expected:**
```json
{"status":"ok","timestamp":"2025-11-21T..."}
```

### 9.2. Test API

```bash
curl "https://scan.salesai.vn/api/products/search?barcode=769915233490"
```

**Expected:**
```json
{
  "list": [{...}],
  "pageInfo": {...}
}
```

### 9.3. Test Web App

1. Mở browser: https://scan.salesai.vn
2. App phải load
3. Click camera icon
4. Nhập barcode: `769915233490`
5. Phải hiện thông tin sản phẩm

---

## 🔧 BƯỚC 10: TROUBLESHOOTING

### Issue 1: Application won't start

**Check logs:**

Trong Plesk:
1. **"Logs"** → **"Error Log"**
2. Hoặc **"Node.js"** → **"Application Logs"**

Via SSH:
```bash
pm2 logs barcode-scanner
```

**Common fixes:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build

# Restart
pm2 restart barcode-scanner
```

---

### Issue 2: Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Fix:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=3000
```

---

### Issue 3: Deployment script fails

**Check:**
1. Vào **"Git"** → **"Deployment History"**
2. Xem **"Logs"** của deployment failed
3. Fix error và deploy lại

**Common issues:**
- Node.js version không đủ (cần 18+)
- npm install failed → Clear cache
- Build failed → Check TypeScript errors

---

### Issue 4: 502 Bad Gateway

**Symptoms:**
- Browser hiện "502 Bad Gateway"

**Causes:**
- Application không chạy
- Port sai trong proxy config
- Application crashed

**Fix:**
```bash
# Check if app is running
pm2 status

# Restart app
pm2 restart barcode-scanner

# Check logs
pm2 logs barcode-scanner --lines 50
```

---

### Issue 5: CORS errors

**Symptoms:**
```
Access to fetch has been blocked by CORS policy
```

**Fix:**

1. Check `.env`:
   ```bash
   ALLOWED_ORIGINS=https://scan.salesai.vn
   ```

2. Không có `http://` trong production
3. Restart app sau khi update

---

## 📁 FILE STRUCTURE TRÊN SERVER

```
/var/www/vhosts/scan.salesai.vn/
├── httpdocs/                    # Application root
│   ├── .env                     # Environment variables
│   ├── .git/                    # Git repository
│   ├── node_modules/            # Dependencies
│   ├── dist/                    # Build output
│   │   ├── index.js            # Server bundle
│   │   └── public/             # Frontend static files
│   ├── server/                  # Source code
│   ├── client/                  # Frontend source
│   ├── package.json
│   └── ...
├── logs/                        # Application logs
└── tmp/                         # Temp files
```

---

## 🔄 UPDATE CODE (Sau lần deploy đầu)

### Via Plesk UI:

1. **"Git"** → **"Pull Updates"**
2. Click **"Deploy"**
3. Đợi build complete
4. Auto restart

### Via SSH:

```bash
cd /var/www/vhosts/scan.salesai.vn/httpdocs

# Pull latest code
git pull origin claude/review-repo-01LXg46RakKUFm6tDuDEuo4G

# Install/update dependencies
npm install

# Build
npm run build

# Restart
pm2 restart barcode-scanner
```

---

## 📊 MONITORING

### Via Plesk:

1. **"Statistics"** → Xem traffic, CPU, memory
2. **"Logs"** → Error logs, access logs
3. **"Node.js"** → Application status

### Via SSH (PM2):

```bash
# Status
pm2 status

# Logs (real-time)
pm2 logs barcode-scanner

# Monitor resources
pm2 monit

# Show info
pm2 info barcode-scanner
```

---

## 🎯 CHECKLIST HOÀN CHỈNH

Sau khi deploy, verify:

- [ ] Git repository connected và deploy thành công
- [ ] Node.js application enabled và running
- [ ] Environment variables đã set đúng
- [ ] SSL certificate active
- [ ] HTTPS redirect working
- [ ] `/api/health` returns 200 OK
- [ ] `/api/products/search` returns data
- [ ] Web app loads at https://scan.salesai.vn
- [ ] Barcode scanning works
- [ ] Product search returns results
- [ ] Logs không có errors
- [ ] PM2 process running stable

---

## 🆘 CẦN HỖ TRỢ?

**Nếu gặp vấn đề:**

1. Check **deployment logs** trong Plesk
2. Check **application logs**: `pm2 logs barcode-scanner`
3. Check **error logs** trong Plesk
4. Chạy debug commands:
   ```bash
   curl https://scan.salesai.vn/api/health
   curl "https://scan.salesai.vn/api/products/search?barcode=769915233490"
   ```
5. Gửi logs cho tôi để debug

---

## 📝 NOTES

- **Port**: Plesk thường assign port tự động, check trong Node.js settings
- **Process manager**: Khuyến nghị dùng PM2 cho stability
- **Auto-restart**: PM2 sẽ auto restart nếu app crash
- **Logs**: Stored in `/var/www/vhosts/scan.salesai.vn/logs/`
- **Backup**: Plesk có auto backup, enable nếu cần

---

## 🚀 DONE!

Sau khi follow tất cả steps, app của bạn sẽ chạy tại:

**https://scan.salesai.vn** ✅

Với:
- ✅ Secure HTTPS
- ✅ Auto-restart on crash
- ✅ Git auto-deployment
- ✅ Production-ready configuration
