# ✅ Refund Management - API Integration Complete

## 📋 Tổng kết các thay đổi:

### 1. **Tạo Refund Types** (`src/lib/types/refund.types.ts`)
- ✅ `RefundStatus`: PENDING | COMPLETED | CANCELLED
- ✅ `Refund` interface phù hợp với API response
- ✅ Request/Response types cho API calls

### 2. **Tạo Refund Service** (`src/lib/services/refund.service.ts`)
- ✅ `getManyRefunds()` - Lấy danh sách hoàn tiền với phân trang và filter
- ✅ `getRefund(id)` - Lấy chi tiết một yêu cầu hoàn tiền

### 3. **Cập nhật RefundsListPage** 
- ✅ Xóa mock data, sử dụng API
- ✅ Search box với debounce 500ms
- ✅ Dropdown trạng thái (PENDING, COMPLETED, CANCELLED)
- ✅ Loading state
- ✅ Server-side pagination
- ✅ Summary cards hiển thị thống kê từ dữ liệu hiện tại
- ✅ Tính toán finalAmount = amount - (penalty + damage + overtime)
- ✅ Hiển thị booking ID và user ID

### 4. **Cập nhật RefundDetailPage**
- ✅ Xóa mock data, sử dụng API
- ✅ Loading state
- ✅ Error handling với redirect
- ✅ Hiển thị principal (số tiền gốc)
- ✅ Tính toán finalAmount từ các trường API
- ✅ Hiển thị tất cả phí trừ (penalty, damage, overtime)
- ✅ Tỷ lệ hoàn lại = (finalAmount / amount) * 100

## 🔧 API Integration Details:

### Endpoint: `GET /refund`
**Query Parameters:**
- `limit` (number): Số items mỗi trang (default: 10)
- `page` (number): Trang hiện tại (default: 1)
- `status` (string, optional): PENDING | COMPLETED | CANCELLED
- `search` (string, optional): Tìm kiếm

**Response:**
```typescript
{
  data: {
    refunds: [
      {
        id: string,
        userId: string,
        bookingId: string,
        principal: number,        // Số tiền gốc
        amount: number,           // Số tiền hoàn lại
        penaltyAmount: number,    // Phí phạt
        damageAmount: number,     // Phí thiệt hại
        overtimeAmount: number,   // Phí quá hạn
        status: RefundStatus,
        createdAt: string,
        updatedAt: string
      }
    ],
    page: number,
    limit: number,
    totalItems: number,
    totalPages: number
  },
  message: string,
  statusCode: number
}
```

### Endpoint: `GET /refund/:id`
**Response:** Single Refund object

## 📊 Features:

### Search Box
- ✅ Placeholder: "Tìm kiếm..."
- ✅ Debounce 500ms
- ✅ Auto reset về trang 1
- ✅ Console logs để debug

### Status Filter Dropdown
- ✅ Placeholder: "Chọn trạng thái"
- ✅ Options:
  - Tất Cả Trạng Thái (all)
  - Đã Hoàn Tiền (COMPLETED)
  - Đang Xử Lý (PENDING)
  - Đã Hủy (CANCELLED)
- ✅ Reset về trang 1 khi thay đổi

### Summary Cards
- ✅ **Đã Hoàn Tiền**: Số lượng refund có status COMPLETED
- ✅ **Đang Xử Lý**: Số lượng refund có status PENDING
- ✅ **Đã Hủy**: Số lượng refund có status CANCELLED
- 📝 **Note**: Hiển thị stats từ trang hiện tại (không phải tổng toàn bộ)

### Table Display
- ✅ Mã Booking (8 ký tự đầu)
- ✅ User ID (8 ký tự đầu)
- ✅ Số Tiền Hoàn (amount)
- ✅ Phí Trừ (penalty + damage + overtime)
- ✅ Thực Nhận (finalAmount = amount - totalDeductions)
- ✅ Trạng Thái (badge có màu)
- ✅ Ngày Tạo
- ✅ Action: Xem chi tiết

## 🧮 Calculation Logic:

```typescript
// Tính tổng phí trừ
const totalDeductions = 
  refund.penaltyAmount + 
  refund.damageAmount + 
  refund.overtimeAmount;

// Tính số tiền thực nhận
const finalAmount = refund.amount - totalDeductions;

// Tính tỷ lệ hoàn lại
const refundRate = (finalAmount / refund.amount) * 100;
```

## 🧪 Test Cases:

### Test 1: Load trang lần đầu
- ✅ Trang tự động load 10 refunds đầu tiên
- ✅ Hiển thị tổng số "Tìm thấy: X yêu cầu"
- ✅ Summary cards hiển thị số lượng theo status

### Test 2: Search
1. Nhập text vào search box
2. Đợi 500ms
3. ✅ API được gọi với `search=...`
4. ✅ Danh sách được filter

### Test 3: Filter theo Status
1. Chọn "Đã Hoàn Tiền" trong dropdown
2. ✅ API được gọi với `status=COMPLETED`
3. ✅ Chỉ hiển thị refund có status COMPLETED
4. ✅ Reset về trang 1

### Test 4: Pagination
1. Click trang 2
2. ✅ API được gọi với `page=2`
3. ✅ Hiển thị refund từ item 11 trở đi

### Test 5: View Detail
1. Click icon mắt ở một refund
2. ✅ Navigate đến `/refunds/:id`
3. ✅ Load chi tiết refund từ API
4. ✅ Hiển thị đầy đủ thông tin:
   - Mã yêu cầu
   - Booking ID
   - User ID
   - Principal (số tiền gốc)
   - Các khoản phí trừ
   - Số tiền thực nhận
   - Tỷ lệ hoàn lại
   - Lịch sử xử lý

## 🔍 Debugging:

Mở Chrome DevTools (F12):

### Console Tab:
```
Loading refunds with params: { page: 1, limit: 10 }
Response: { refunds: [...], page: 1, limit: 10, totalItems: 2, totalPages: 1 }
```

### Network Tab:
- **URL**: `https://journey-admin.hacmieu.xyz/api/refund?limit=10&page=1`
- **Method**: GET
- **Status**: 200
- **Response**: JSON với cấu trúc đúng

## ✅ Kết luận:

Trang quản lý hoàn tiền đã được tích hợp hoàn chỉnh với backend API:
- ✅ Search với debounce
- ✅ Filter theo status
- ✅ Pagination
- ✅ Loading state
- ✅ Error handling
- ✅ Tính toán số tiền chính xác
- ✅ Hiển thị thông tin đầy đủ

**Note quan trọng**: 
- API không trả về `paymentCode`, `userName`, `rentalId`, `finalAmount`
- Đã thay thế bằng: `bookingId`, `userId`, và tính toán `finalAmount` từ các trường có sẵn
- Summary cards hiển thị stats từ dữ liệu trang hiện tại (do API chỉ trả về 1 trang)
