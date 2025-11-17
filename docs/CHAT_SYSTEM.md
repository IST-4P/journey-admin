# Hệ Thống Chat - Journey Admin

## Tổng quan

Hệ thống chat hoàn chỉnh cho Journey Admin với các tính năng:
- ✅ Quản lý danh sách conversations (Many Conversations API)
- ✅ Lịch sử chat với phân trang (Many Chats API)
- ✅ WebSocket real-time chat
- ✅ Infinite scroll - tự động load tin nhắn cũ khi kéo lên
- ✅ UI/UX tương tự Messenger/WhatsApp

## Cấu trúc Files

```
src/
├── lib/
│   ├── services/
│   │   └── chat.service.ts          # API service cho chat
│   ├── types/
│   │   └── chat.ts                  # TypeScript types
│   └── utils/
│       ├── ws-client.ts             # WebSocket client
│       └── auth.ts                  # Authentication utilities
└── pages/
    └── chat/
        └── ChatPage.tsx             # Main chat page component
```

## API Endpoints

### 1. Many Conversations (GET `/chat/conversations`)
Lấy danh sách các cuộc trò chuyện gần nhất.

**Query Parameters:**
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng conversations mỗi trang (mặc định: 15)

**Response:**
```typescript
{
  data: {
    conversations: [
      {
        id: string;           // User ID để chat
        fullName: string;     // Tên người dùng
        avatarUrl?: string;   // URL avatar
      }
    ];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}
```

### 2. Many Chats (GET `/chat`)
Lấy lịch sử chat với một người dùng cụ thể, sắp xếp từ **mới nhất đến cũ nhất**.

**Query Parameters:**
- `toUserId`: ID của người dùng cần chat (bắt buộc)
- `page`: Số trang (mặc định: 1)
- `limit`: Số lượng messages mỗi trang (mặc định: 20)

**Response:**
```typescript
{
  data: {
    chats: [
      {
        id: string;
        fromUserId: string;
        toUserId: string;
        content: string;
        createdAt: string;  // ISO 8601 format
      }
    ];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}
```

## WebSocket Events

### Client → Server

**`sendChat`** - Gửi tin nhắn mới
```typescript
socket.emit('sendChat', {
  toUserId: string;
  content: string;
});
```

### Server → Client

**`newChat`** - Nhận tin nhắn mới
```typescript
socket.on('newChat', (data: ChatMessage) => {
  // Handle incoming message
});
```

## Tính năng chính

### 1. Infinite Scroll
- Khi kéo khung chat lên **gần đầu** (scrollTop < 100px):
  - Tự động tăng `page` lên 1
  - Gọi API `getManyChats` với page mới
  - Append messages cũ vào đầu danh sách
  - **Giữ nguyên vị trí scroll** để UX mượt mà

### 2. WebSocket Real-time
- Kết nối WebSocket khi vào trang chat
- Lắng nghe event `newChat` để nhận tin nhắn real-time
- Gửi tin nhắn qua event `sendChat`
- **Không có API POST** - tất cả gửi tin qua WebSocket

### 3. Auto-scroll
- Tự động scroll xuống cuối khi:
  - Load conversation lần đầu
  - Gửi tin nhắn mới
  - Nhận tin nhắn mới (nếu đang ở gần cuối)
- Không scroll khi đang xem tin nhắn cũ ở trên

### 4. Search & Filter
- Tìm kiếm conversation theo tên người dùng
- Filter local (hoặc có thể chuyển sang server-side)

## Cấu hình Environment Variables

Thêm vào `.env`:

```env
# API Base URL
VITE_API_BASE_URL=https://journey-admin.hacmieu.xyz/api

# WebSocket URL
VITE_WS_URL=https://journey-api.hacmieu.xyz
```

## Cách sử dụng

### 1. Import và sử dụng ChatPage

```typescript
import { ChatPage } from './pages/chat/ChatPage';

// Trong routes
<Route path="/chat" element={<ChatPage />} />
```

### 2. Sử dụng Chat Service

```typescript
import { chatService } from '@/lib/services/chat.service';

// Lấy conversations
const response = await chatService.getManyConversations({ 
  page: 1, 
  limit: 15 
});

// Lấy messages
const messages = await chatService.getManyChats({ 
  toUserId: 'user-id', 
  page: 1, 
  limit: 20 
});
```

### 3. Sử dụng WebSocket Client

```typescript
import { connectChatSocket } from '@/lib/utils/ws-client';

const socket = connectChatSocket();

// Lắng nghe tin nhắn mới
const unsubscribe = socket.on('newChat', (message) => {
  console.log('New message:', message);
});

// Gửi tin nhắn
socket.emit('sendChat', {
  toUserId: 'user-id',
  content: 'Hello!',
});

// Cleanup
unsubscribe();
socket.close();
```

## Flow hoạt động

### Khi mở trang Chat:
1. Load danh sách conversations (page 1)
2. Kết nối WebSocket
3. Lắng nghe event `newChat`

### Khi chọn một conversation:
1. Reset messages state
2. Gọi API `getManyChats` với page=1
3. Hiển thị 20 tin nhắn mới nhất
4. Scroll xuống cuối

### Khi kéo khung chat lên trên:
1. Detect khi scrollTop < 100px
2. Kiểm tra `hasMoreMessages`
3. Tăng page lên 1
4. Gọi API `getManyChats` với page mới
5. Prepend messages vào đầu danh sách
6. Giữ nguyên vị trí scroll

### Khi gửi tin nhắn:
1. Emit event `sendChat` qua WebSocket
2. Thêm message optimistically vào UI
3. Scroll xuống cuối
4. Server sẽ broadcast lại qua `newChat`

### Khi nhận tin nhắn mới:
1. Nhận event `newChat` từ WebSocket
2. Kiểm tra duplicate (dựa vào ID)
3. Append vào cuối messages
4. Cập nhật conversation list
5. Auto-scroll nếu đang ở cuối

## TypeScript Types

### Conversation
```typescript
interface Conversation {
  id: string;              // User ID (dùng làm toUserId khi chat)
  fullName: string;        // Tên đầy đủ
  avatarUrl?: string;      // URL avatar
}

// Extended version trong UI
interface ConversationWithState extends Conversation {
  lastMessage?: string;        // Tin nhắn cuối (managed by frontend)
  lastMessageDate?: string;    // Thời gian tin nhắn cuối
  unread?: number;             // Số tin nhắn chưa đọc
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}
```

## Lưu ý Backend

API `getManyChats` cần trả về messages theo thứ tự **mới nhất đến cũ nhất** (DESC by createdAt).

Ví dụ query SQL:
```sql
SELECT * FROM chats 
WHERE (fromUserId = ? AND toUserId = ?) 
   OR (fromUserId = ? AND toUserId = ?)
ORDER BY createdAt DESC
LIMIT ? OFFSET ?
```

Frontend sẽ đảo ngược thứ tự khi hiển thị để tin nhắn mới nhất ở dưới cùng.

## Troubleshooting

### WebSocket không kết nối được
- Kiểm tra `VITE_WS_URL` trong `.env`
- Kiểm tra backend WebSocket server đã chạy
- Kiểm tra CORS settings

### Tin nhắn bị duplicate
- Backend cần đảm bảo mỗi message có unique ID
- Frontend đã có logic check duplicate

### Scroll không hoạt động đúng
- Kiểm tra ref `messagesScrollRef` đã attach đúng element
- Kiểm tra CSS của scroll container (overflow-y-auto)

## Dependencies

```json
{
  "socket.io-client": "^4.x.x",
  "sonner": "^1.x.x" // for toast notifications
}
```

## Tác giả

Journey Admin Team - 2024
