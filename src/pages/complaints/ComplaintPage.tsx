import {
  Send,
  Search,
  MoreVertical,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Filter,
  Check,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Pagination } from '../../components/common/Pagination';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { complaintService } from '../../lib/services/complaint.service';
import { Complaint, ComplaintMessage } from '../../lib/types/complaint';
import { uploadImage } from '../../lib/services/media.service';
import { toast } from 'sonner';

const COMPLAINTS_PER_PAGE = 15;
const MESSAGES_PER_PAGE = 20;

// Extended Complaint type for UI state
interface ComplaintWithState extends Complaint {
  userName?: string;
  userAvatar?: string;
}

export function ComplaintPage() {
  // Complaints state
  const [complaints, setComplaints] = useState<ComplaintWithState[]>([]);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const [complaintsTotalPages, setComplaintsTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(''); // '' = All, 'OPEN', 'IN_PROGRESS', 'CLOSED'
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(false);

  // Complaint messages state
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithState | null>(null);
  const [messages, setMessages] = useState<ComplaintMessage[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // WebSocket - Direct Socket.IO like ChatPage
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Refs
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const isFetchingMessagesRef = useRef(false);
  const shouldStickToBottomRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load complaints
  const loadComplaints = useCallback(async (page: number, search: string = '', status: string = '') => {
    setIsLoadingComplaints(true);
    try {
      const params: any = {
        page,
        limit: COMPLAINTS_PER_PAGE,
      };
      
      if (status) {
        params.status = status;
      }
      
      const response = await complaintService.getManyComplaints(params);

      console.log('[ComplaintPage] Raw response:', response);

      // Xử lý trường hợp API trả về empty object hoặc không có complaints array
      // Ví dụ: { data: {}, message: "Error.ComplaintNotFound", statusCode: 404 }
      const complaints = response?.complaints || [];
      const totalPages = response?.totalPages || 1;

      console.log('[ComplaintPage] Complaints array:', complaints);

      // Filter by search if needed
      let filteredComplaints = complaints as ComplaintWithState[];
      
      if (search) {
        filteredComplaints = filteredComplaints.filter((complaint) =>
          complaint.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      setComplaints(filteredComplaints);
      setComplaintsTotalPages(totalPages);
      console.log('[ComplaintPage] Loaded complaints:', filteredComplaints);
    } catch (error: any) {
      console.error('Failed to load complaints:', error);
      
      // Nếu lỗi 404 (ComplaintNotFound), set empty array thay vì hiển thị toast error
      if (error?.response?.status === 404 || error?.statusCode === 404) {
        console.log('[ComplaintPage] No complaints found (404), showing empty state');
        setComplaints([]);
        setComplaintsTotalPages(1);
      } else {
        // Các lỗi khác mới hiển thị toast
        toast.error('Không thể tải danh sách khiếu nại');
      }
    } finally {
      setIsLoadingComplaints(false);
    }
  }, []);

  // Load messages for a complaint
  const loadMessages = useCallback(
    async (complaintId: string, page: number, replace: boolean = false) => {
      if (isFetchingMessagesRef.current) return;

      isFetchingMessagesRef.current = true;
      if (replace) {
        setIsLoadingMessages(true);
      } else {
        setIsLoadingOlderMessages(true);
      }

      try {
        const response = await complaintService.getManyComplaintMessages({
          complaintId,
          page,
          limit: MESSAGES_PER_PAGE,
        });

        console.log('[ComplaintPage] Raw messages response:', response);

        // API returns messages DESC (newest first), reverse to ASC (oldest first) for UI
        const complaintMessages = response.complaintMessages || [];
        const newMessages = [...complaintMessages].reverse();

        if (replace) {
          // Initial load - replace all messages (oldest to newest)
          setMessages(newMessages);
          setMessagesPage(page);
          setHasMoreMessages(complaintMessages.length === MESSAGES_PER_PAGE);
          
          // Scroll to bottom
          requestAnimationFrame(() => {
            if (messagesScrollRef.current) {
              messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
            }
          });
        } else {
          // Loading older messages - prepend to beginning
          const scrollContainer = messagesScrollRef.current;
          const prevScrollHeight = scrollContainer?.scrollHeight ?? 0;
          const prevScrollTop = scrollContainer?.scrollTop ?? 0;

          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id));
            const uniqueNew = newMessages.filter((msg) => !existingIds.has(msg.id));
            // Prepend older messages to the beginning
            return [...uniqueNew, ...prev];
          });

          setMessagesPage(page);
          setHasMoreMessages(complaintMessages.length === MESSAGES_PER_PAGE);

          // Maintain scroll position
          requestAnimationFrame(() => {
            if (scrollContainer) {
              const newScrollHeight = scrollContainer.scrollHeight;
              scrollContainer.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
            }
          });
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Không thể tải tin nhắn');
      } finally {
        isFetchingMessagesRef.current = false;
        if (replace) {
          setIsLoadingMessages(false);
        } else {
          setIsLoadingOlderMessages(false);
        }
      }
    },
    []
  );

  // Handle scroll to load older messages
  const handleMessagesScroll = useCallback(() => {
    const container = messagesScrollRef.current;
    if (!container || !selectedComplaint) return;

    const nearTop = container.scrollTop < 100;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    shouldStickToBottomRef.current = nearBottom;

    // Load older messages when scrolled to top
    if (nearTop && hasMoreMessages && !isLoadingOlderMessages && !isFetchingMessagesRef.current) {
      loadMessages(selectedComplaint.id, messagesPage + 1, false);
    }
  }, [selectedComplaint, hasMoreMessages, isLoadingOlderMessages, messagesPage, loadMessages]);

  // Send message via WebSocket
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedComplaint || !socket) {
      if (!socket) {
        toast.error('WebSocket chưa kết nối');
      }
      return;
    }

    if (!socket.connected) {
      toast.error('WebSocket đã ngắt kết nối, vui lòng đợi...');
      return;
    }

    const content = messageInput.trim();
    setMessageInput('');

    // Payload giống test-complaint.html
    const message = {
      complaintId: selectedComplaint.id,
      messageType: 'TEXT',
      content: content,
    };

    console.log('[Complaint] 📤 Sending TEXT message:', message);
    socket.emit('sendComplaintMessage', message);

    // Scroll to bottom
    requestAnimationFrame(() => {
      if (messagesScrollRef.current) {
        messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
      }
    });
  }, [messageInput, selectedComplaint, socket]);

  // Handle image upload and send IMAGE message
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedComplaint || !socket) {
      if (!socket) {
        toast.error('WebSocket chưa kết nối');
      }
      return;
    }

    if (!socket.connected) {
      toast.error('WebSocket đã ngắt kết nối, vui lòng đợi...');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploadingImage(true);
    try {
      console.log('[Complaint] 📤 Uploading image:', file.name);
      
      // Upload image using presigned URL
      const imageUrl = await uploadImage(file);
      
      console.log('[Complaint] ✅ Image uploaded:', imageUrl);

      // Send IMAGE message via WebSocket
      const message = {
        complaintId: selectedComplaint.id,
        messageType: 'IMAGE',
        content: imageUrl,
      };

      console.log('[Complaint] 📤 Sending IMAGE message:', message);
      socket.emit('sendComplaintMessage', message);

      toast.success('Đã gửi hình ảnh');

      // Scroll to bottom
      requestAnimationFrame(() => {
        if (messagesScrollRef.current) {
          messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
        }
      });
    } catch (error) {
      console.error('[Complaint] ❌ Error uploading image:', error);
      toast.error('Lỗi khi tải lên hình ảnh');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [selectedComplaint, socket]);

  // Handle incoming message from WebSocket - Giống ChatPage
  const handleNewMessage = useCallback((data: ComplaintMessage) => {
    console.log('[Complaint] 📨 Received newComplaintMessage:', data);
    
    setMessages((prev) => {
      // Tránh duplicate
      if (prev.some((msg) => msg.id === data.id)) {
        return prev;
      }
      return [...prev, data];
    });

    // Scroll to bottom nếu đang ở cuối
    if (shouldStickToBottomRef.current) {
      requestAnimationFrame(() => {
        if (messagesScrollRef.current) {
          messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
        }
      });
    }
  }, []);

  // Initialize WebSocket - Giống ChatPage
  useEffect(() => {
    if (!selectedComplaint?.id) {
      return;
    }

    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    const namespace = '/complaint';

    console.log('[Complaint] 🔌 Connecting WebSocket to:', `${wsUrl}${namespace}`);
    console.log('[Complaint] 🍪 Using httpOnly cookies (sent automatically by browser)');
    console.log('[Complaint] 📋 Complaint ID:', selectedComplaint.id);

    // Socket.IO options với query parameter complaintId
    const socketOptions: any = {
      withCredentials: true, // Browser tự động gửi httpOnly cookies
      transports: ['websocket', 'polling'],
      query: {
        complaintId: selectedComplaint.id,
      },
    };

    console.log('[Complaint] ✅ Browser will automatically send httpOnly cookies with requests');

    const socketInstance = io(`${wsUrl}${namespace}`, socketOptions);
    setSocket(socketInstance);

    // Lắng nghe events
    socketInstance.on('connect', () => {
      console.log('[Complaint] ✅ WebSocket connected! Socket ID:', socketInstance.id);
      setIsSocketConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Complaint] ❌ WebSocket disconnected. Reason:', reason);
      setIsSocketConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('[Complaint] ❌ Connection error:', error.message);
      setIsSocketConnected(false);
    });

    // Lắng nghe event 'newComplaintMessage' - QUAN TRỌNG
    socketInstance.on('newComplaintMessage', (data: ComplaintMessage) => {
      console.log('[Complaint] 📨 New complaint message:', data);
      handleNewMessage(data);
    });

    // Cleanup
    return () => {
      console.log('[Complaint] 🔌 Disconnecting WebSocket...');
      socketInstance.disconnect();
    };
  }, [selectedComplaint?.id, handleNewMessage]);

  // Load complaints on mount
  useEffect(() => {
    loadComplaints(complaintsPage, searchQuery, statusFilter);
  }, [complaintsPage, searchQuery, statusFilter, loadComplaints]);

  // Load messages when complaint is selected
  useEffect(() => {
    if (selectedComplaint) {
      setMessages([]);
      setMessagesPage(1);
      setHasMoreMessages(true);
      loadMessages(selectedComplaint.id, 1, true);
    }
  }, [selectedComplaint, loadMessages]);

  // Helper functions
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays === 1) return 'Hôm qua';
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const isMessageFromAdmin = (message: ComplaintMessage) => {
    // Admin messages have senderId that's not the complaint's userId
    // Or check if it's the optimistic message
    if (!selectedComplaint) return false;
    return message.senderId === 'ADMIN' || message.senderId !== selectedComplaint.userId;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      OPEN: { label: 'Mở', className: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: 'Đang xử lý', className: 'bg-yellow-100 text-yellow-800' },
      CLOSED: { label: 'Đã đóng', className: 'bg-gray-100 text-gray-800' },
    };
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <Badge className={`${config.className} border-0`}>
        {config.label}
      </Badge>
    );
  };

  // Update complaint status
  const handleUpdateStatus = useCallback(async (complaintId: string, newStatus: 'OPEN' | 'IN_PROGRESS' | 'CLOSED') => {
    try {
      await complaintService.updateComplaintStatus({
        id: complaintId,
        status: newStatus,
      });

      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === complaintId ? { ...c, status: newStatus } : c))
      );

      if (selectedComplaint?.id === complaintId) {
        setSelectedComplaint((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      toast.success(`Đã cập nhật trạng thái thành "${getStatusLabel(newStatus)}"`);
    } catch (error) {
      console.error('Failed to update complaint status:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  }, [selectedComplaint]);

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'Mở',
      IN_PROGRESS: 'Đang xử lý',
      CLOSED: 'Đã đóng',
    };
    return map[status] || status;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Quản Lý Khiếu Nại</h2>
        
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setComplaintsPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="OPEN">Mở</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="CLOSED">Đã đóng</option>
          </select>
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{ height: 'calc(100vh - 12rem)' }}
      >
        {/* Complaints List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm khiếu nại..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setComplaintsPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Complaints List */}
          <div className="flex-1 overflow-hidden">
            {isLoadingComplaints ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : complaints.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Không có khiếu nại nào</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {complaints.map((complaint) => {
                    // Màu border-left theo status
                    const borderColor = 
                      complaint.status === 'OPEN' ? 'border-blue-500' :
                      complaint.status === 'IN_PROGRESS' ? 'border-yellow-500' :
                      'border-gray-500';
                    
                    const bgColor = 
                      selectedComplaint?.id === complaint.id ? 'bg-blue-50' :
                      complaint.status === 'OPEN' ? 'hover:bg-blue-50/50' :
                      complaint.status === 'IN_PROGRESS' ? 'hover:bg-yellow-50/50' :
                      'hover:bg-gray-50';
                    
                    return (
                      <button
                        key={complaint.id}
                        onClick={() => setSelectedComplaint(complaint)}
                        className={`w-full p-4 text-left transition-colors relative border-l-4 ${borderColor} ${bgColor}`}
                      >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${complaint.userId}`}
                            />
                            <AvatarFallback className="bg-[#007BFF] text-white">
                              <AlertCircle className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium truncate">
                              {complaint.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(complaint.status)}
                          </div>
                          <p className="text-xs text-gray-400">
                            {getRelativeTime(complaint.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 border-t bg-gray-50 flex-shrink-0">
            <Pagination
              currentPage={complaintsPage}
              totalPages={complaintsTotalPages}
              onPageChange={setComplaintsPage}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          {selectedComplaint ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedComplaint.userId}`}
                      />
                      <AvatarFallback className="bg-[#007BFF] text-white">
                        <AlertCircle className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedComplaint.title}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedComplaint.status)}
                      <span className="text-xs text-gray-500">
                        User ID: {selectedComplaint.userId.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-[#007BFF]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'OPEN')}
                      disabled={selectedComplaint.status === 'OPEN'}
                      className="cursor-pointer"
                    >
                      {selectedComplaint.status === 'OPEN' && <Check className="h-4 w-4 mr-2" />}
                      {selectedComplaint.status !== 'OPEN' && <div className="h-4 w-4 mr-2" />}
                      Đánh dấu Mở
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'IN_PROGRESS')}
                      disabled={selectedComplaint.status === 'IN_PROGRESS'}
                      className="cursor-pointer"
                    >
                      {selectedComplaint.status === 'IN_PROGRESS' && <Check className="h-4 w-4 mr-2" />}
                      {selectedComplaint.status !== 'IN_PROGRESS' && <div className="h-4 w-4 mr-2" />}
                      Đánh dấu Đang xử lý
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'CLOSED')}
                      disabled={selectedComplaint.status === 'CLOSED'}
                      className="cursor-pointer"
                    >
                      {selectedComplaint.status === 'CLOSED' && <Check className="h-4 w-4 mr-2" />}
                      {selectedComplaint.status !== 'CLOSED' && <div className="h-4 w-4 mr-2" />}
                      Đánh dấu Đã đóng
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Messages - Scrollable Area */}
              <div className="flex-1 overflow-hidden bg-gray-50">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div
                    ref={messagesScrollRef}
                    className="p-4 space-y-4 h-full overflow-y-auto"
                    onScroll={handleMessagesScroll}
                  >
                    {/* Loading older messages indicator */}
                    {isLoadingOlderMessages && (
                      <div className="flex justify-center py-2">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    )}

                    {messages.map((message, index) => {
                      const isFromAdmin = isMessageFromAdmin(message);
                      const showDateSeparator =
                        index === 0 ||
                        new Date(messages[index - 1].createdAt).toDateString() !==
                          new Date(message.createdAt).toDateString();

                      return (
                        <div key={message.id}>
                          {/* Date separator */}
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                                {new Date(message.createdAt).toLocaleDateString('vi-VN', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </div>
                            </div>
                          )}

                          {/* Message bubble */}
                          <div
                            className={`flex items-end gap-2 ${
                              isFromAdmin ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            {!isFromAdmin && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarImage
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedComplaint.userId}`}
                                />
                                <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                  U
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex flex-col items-start max-w-[70%]">
                              <div
                                className={`rounded-2xl px-4 py-2 shadow-sm ${
                                  isFromAdmin
                                    ? 'bg-[#007BFF] text-white rounded-br-none'
                                    : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                                }`}
                              >
                                {message.messageType === 'IMAGE' ? (
                                  <div className="space-y-2">
                                    <img
                                      src={message.content}
                                      alt="Complaint attachment"
                                      className="max-w-full max-h-64 rounded-lg cursor-pointer object-contain"
                                      onClick={() => window.open(message.content, '_blank')}
                                      onError={(e) => {
                                        e.currentTarget.src = '';
                                        e.currentTarget.alt = '❌ Lỗi tải hình ảnh';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <p className="break-words text-sm">{message.content}</p>
                                )}
                              </div>
                              <div className={`flex items-center gap-1 mt-1 px-2 ${
                                isFromAdmin ? 'self-end' : 'self-start'
                              }`}>
                                <p className="text-xs text-gray-400">
                                  {formatTime(message.createdAt)}
                                </p>
                                {isFromAdmin && (
                                  <span className="text-xs text-gray-400">✓</span>
                                )}
                              </div>
                            </div>
                            {isFromAdmin && (
                              <Avatar className="h-8 w-8 flex-shrink-0">
                                <AvatarFallback className="bg-[#007BFF] text-white text-xs">
                                  AD
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Message Input - Fixed at Bottom */}
              <div className="p-4 border-t bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  {/* Image upload button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage || !isSocketConnected}
                    className="text-gray-500 hover:text-[#007BFF] flex-shrink-0"
                    title="Gửi hình ảnh"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                  </Button>

                  <Input
                    placeholder="Nhập tin nhắn trả lời..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isUploadingImage}
                    className="flex-1 rounded-full border-gray-300 focus:border-[#007BFF]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isSocketConnected || isUploadingImage}
                    className="bg-[#007BFF] hover:bg-[#0056b3] disabled:bg-gray-300 rounded-full h-10 w-10 p-0 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* WebSocket Status */}
                {!isSocketConnected && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span>Đang kết nối WebSocket...</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Quản lý khiếu nại
                </h3>
                <p className="text-sm">Chọn một khiếu nại để xem chi tiết và trả lời</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
