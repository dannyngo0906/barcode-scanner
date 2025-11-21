# 🔍 DEBUG API ISSUE

## ❓ Câu hỏi cho bạn:

### 1. Curl command của bạn trả về gì?

Chạy command này và cho tôi biết kết quả:

```bash
curl --location 'https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records' \
--header 'xc-token: 1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA'
```

**Kết quả mong đợi:**
```json
{
  "list": [...],
  "pageInfo": {...}
}
```

### 2. Làm thế nào để query với barcode?

Với NocoDB v3, để tìm product theo barcode, bạn dùng query như thế nào?

**v2 (cũ):**
```
/api/v2/tables/xxx/records?where=(barcode,eq,769915233490)
```

**v3 (mới):**
```
/api/v3/data/xxx/xxx/records?___CẦN_GÌ_ĐÂY___
```

### 3. Test với barcode cụ thể:

```bash
# Thử command này với barcode 769915233490
curl --location 'https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records?WHERE_CLAUSE_HERE' \
--header 'xc-token: 1Owqe7hG7sV0V16DQCv_BPC0gUDLITp-_yRXvLGA'
```

Thay `WHERE_CLAUSE_HERE` bằng gì để filter theo barcode?

---

## 🐛 VẤN ĐỀ TÔI PHÁT HIỆN:

### Server code (server/routes.ts:48-49)

```javascript
// ❌ Đang dùng v2 syntax:
const where = encodeURIComponent(`(barcode,eq,${barcode})`);
const url = `${env.NOCODB_BASE_URL}?offset=0&limit=25&where=${where}`;
```

**URL được tạo ra:**
```
https://db.salesai.vn/api/v3/data/pc6dn5x2psu1vsz/m3rrbw0dbrlqogw/records?offset=0&limit=25&where=(barcode%2Ceq%2C769915233490)
```

**Vấn đề:**
- URL base đã là **v3**: `/api/v3/data/...`
- Nhưng query vẫn dùng **v2 syntax**: `where=(barcode,eq,xxx)`
- NocoDB v3 có thể đã thay đổi query syntax!

---

## ✅ GIẢI PHÁP TẠM THỜI:

Hãy cho tôi biết:

1. **Curl command đầy đủ** (bao gồm cả query params) mà bạn đã test thành công
2. **Response** bạn nhận được (ít nhất 10 dòng đầu)
3. Làm thế nào để **filter theo barcode** trong v3?

Sau đó tôi sẽ **sửa code** cho đúng!

---

## 🔧 CÁC KHẢ NĂNG:

### Option 1: v3 vẫn dùng `where` nhưng syntax khác

```
?where[barcode][eq]=769915233490
```

### Option 2: v3 dùng `filter`

```
?filter={"barcode":{"eq":"769915233490"}}
```

### Option 3: v3 dùng query params trực tiếp

```
?barcode=769915233490
```

### Option 4: v3 dùng `fields` và giá trị

```
?fields=barcode&barcode=769915233490
```

---

**Hãy test và cho tôi biết option nào hoạt động!** 🙏
