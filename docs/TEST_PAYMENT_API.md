# Test Payment API Integration

## ✅ Các thay đổi đã thực hiện:

### 1. **Search Box (Debounced)**
- ✅ Input field với placeholder "Tìm mã thanh toán..."
- ✅ Debounce 500ms để tránh gọi API liên tục khi người dùng đang nhập
- ✅ Reset về trang 1 khi search thay đổi
- ✅ Gửi params `search` đến API

### 2. **Dropdown Trạng Thái (Status Filter)**
- ✅ Placeholder: "Chọn trạng thái"
- ✅ Options:
  - Tất Cả Trạng Thái (all)
  - Đã Thanh Toán (PAID)
  - Chờ Thanh Toán (PENDING)
  - Thất Bại (FAILED)
- ✅ Gửi params `status` đến API (nếu không phải "all")
- ✅ Reset về trang 1 khi thay đổi filter

### 3. **Dropdown Loại (Type Filter)**
- ✅ Placeholder: "Chọn loại"
- ✅ Options:
  - Tất Cả Loại (all)
  - Phương Tiện (VEHICLE)
  - Thiết Bị (DEVICE)
- ✅ Gửi params `type` đến API (nếu không phải "all")
- ✅ Reset về trang 1 khi thay đổi filter

## 🔍 Cách kiểm tra API đang hoạt động:

### Bước 1: Mở Console của trình duyệt
1. Nhấn F12 hoặc chuột phải > Inspect
2. Chuyển sang tab "Console"
3. Chuyển sang tab "Network"

### Bước 2: Kiểm tra Console Logs
Khi trang load hoặc khi bạn thay đổi filter, bạn sẽ thấy:
```
Loading payments with params: { page: 1, limit: 10 }
Response: { payments: [...], page: 1, limit: 10, totalItems: 11, totalPages: 2 }
```

### Bước 3: Kiểm tra Network Tab
Trong tab Network, tìm request đến:
- **URL**: `https://journey-admin.hacmieu.xyz/api/payment`
- **Method**: GET
- **Query Params**: 
  - `limit=10`
  - `page=1`
  - `status=PAID` (nếu chọn filter)
  - `type=VEHICLE` (nếu chọn filter)
  - `search=VE2511` (nếu có nhập search)

### Bước 4: Kiểm tra Response
Response phải có cấu trúc:
```json
{
  "data": {
    "payments": [...],
    "page": 1,
    "limit": 10,
    "totalItems": 11,
    "totalPages": 2
  },
  "message": "Success",
  "statusCode": 200
}
```

## 🧪 Test Cases để thử:

### Test 1: Load trang lần đầu
- ✅ Trang tự động load 10 payments đầu tiên
- ✅ Hiển thị tổng số "Tìm thấy: 11 thanh toán"
- ✅ Phân trang hiển thị 2 trang

### Test 2: Search
1. Nhập "VE2511" vào search box
2. Đợi 500ms
3. ✅ API được gọi với `search=VE2511`
4. ✅ Danh sách được filter

### Test 3: Filter theo Status
1. Chọn "Đã Thanh Toán" trong dropdown
2. ✅ API được gọi với `status=PAID`
3. ✅ Chỉ hiển thị payment có status PAID
4. ✅ Reset về trang 1

### Test 4: Filter theo Type
1. Chọn "Phương Tiện" trong dropdown
2. ✅ API được gọi với `type=VEHICLE`
3. ✅ Chỉ hiển thị payment có type VEHICLE
4. ✅ Reset về trang 1

### Test 5: Combine Filters
1. Search "VE2511" + Status "PAID" + Type "VEHICLE"
2. ✅ API được gọi với tất cả params
3. ✅ Kết quả được filter theo tất cả điều kiện

### Test 6: Pagination
1. Click trang 2
2. ✅ API được gọi với `page=2`
3. ✅ Hiển thị payment từ 11 trở đi

## 🐛 Troubleshooting:

### Nếu không thấy dữ liệu:
1. Kiểm tra console có lỗi không
2. Kiểm tra Network tab có request thành công không (status 200)
3. Kiểm tra response data có đúng format không

### Nếu filter không hoạt động:
1. Mở Console và xem log "Loading payments with params"
2. Kiểm tra params có đúng không
3. Kiểm tra Network tab, query params có được gửi đi không

### Nếu search gọi API nhiều lần:
- Đã có debounce 500ms, chỉ gọi API sau khi user ngừng nhập 0.5 giây

## 📝 API Endpoint Details:

**Endpoint**: `GET /payment`

**Query Parameters**:
- `limit` (number): Số lượng items mỗi trang (default: 10)
- `page` (number): Trang hiện tại (default: 1)
- `status` (string, optional): PAID | PENDING | FAILED
- `type` (string, optional): VEHICLE | DEVICE
- `search` (string, optional): Tìm kiếm theo mã thanh toán

**Response Structure**:
```typescript
{
  data: {
    payments: Payment[],
    page: number,
    limit: number,
    totalItems: number,
    totalPages: number
  },
  message: string,
  statusCode: number
}
```

## ✅ Kết luận:
Trang quản lý thanh toán đã được tích hợp hoàn chỉnh với backend API, bao gồm:
- ✅ Search với debounce
- ✅ Filter theo status
- ✅ Filter theo type
- ✅ Pagination
- ✅ Loading state
- ✅ Error handling
