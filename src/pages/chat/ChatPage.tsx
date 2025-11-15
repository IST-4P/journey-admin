import {
  Send,
  Trash,
  Search,
  Paperclip,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
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
import { chatService } from '../../lib/services/chat.service';
import { Conversation, ChatMessage } from '../../lib/types/chat';
import { connectChatSocket, WSClient } from '../../lib/utils/ws-client';
import { toast } from 'sonner';

const CONVERSATIONS_PER_PAGE = 15;
const MESSAGES_PER_PAGE = 20;

// Extended Conversation type for UI state
interface ConversationWithState extends Conversation {
  lastMessage?: string;
  lastMessageDate?: string;
  unread?: number;
}

export function ChatPage() {
  // Conversations state
  const [conversations, setConversations] = useState<ConversationWithState[]>([]);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [conversationsTotalPages, setConversationsTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Chat state
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  // WebSocket
  const [chatSocket, setChatSocket] = useState<WSClient | null>(null);

  // Refs
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const isFetchingMessagesRef = useRef(false);
  const shouldStickToBottomRef = useRef(true);

  // Load conversations
  const loadConversations = useCallback(async (page: number, search: string = '') => {
    setIsLoadingConversations(true);
    try {
      const response = await chatService.getManyConversations({
        page,
        limit: CONVERSATIONS_PER_PAGE,
      });

      console.log('[ChatPage] Raw response:', response);
      console.log('[ChatPage] Response type:', typeof response);
      console.log('[ChatPage] Response keys:', Object.keys(response || {}));

      // Axios interceptor already unwraps response.data, so response IS the data
      const conversations = response.conversations || [];
      const totalPages = response.totalPages || 1;

      console.log('[ChatPage] Conversations array:', conversations);
      console.log('[ChatPage] First conversation:', conversations[0]);

      // Preserve all fields from API response
      let filteredConversations = conversations as ConversationWithState[];
      
      if (search) {
        filteredConversations = filteredConversations.filter((conv) =>
          conv.fullName.toLowerCase().includes(search.toLowerCase())
        );
      }

      setConversations(filteredConversations);
      setConversationsTotalPages(totalPages);
      console.log('[ChatPage] Loaded conversations:', filteredConversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(
    async (toUserId: string, page: number, replace: boolean = false) => {
      if (isFetchingMessagesRef.current) return;

      isFetchingMessagesRef.current = true;
      if (replace) {
        setIsLoadingMessages(true);
      } else {
        setIsLoadingOlderMessages(true);
      }

      try {
        const response = await chatService.getManyChats({
          toUserId,
          page,
          limit: MESSAGES_PER_PAGE,
        });

        console.log('[ChatPage] Raw messages response:', response);

        // Axios interceptor already unwraps response.data
        // API returns messages DESC (newest first), reverse to ASC (oldest first) for UI
        const chats = response.chats || [];
        const newMessages = [...chats].reverse();

        if (replace) {
          // Initial load - replace all messages (oldest to newest)
          setMessages(newMessages);
          setMessagesPage(page);
          setHasMoreMessages(chats.length === MESSAGES_PER_PAGE);
          
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
          setHasMoreMessages(chats.length === MESSAGES_PER_PAGE);

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
    if (!container || !selectedConversation) return;

    const nearTop = container.scrollTop < 100;
    const nearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    shouldStickToBottomRef.current = nearBottom;

    // Load older messages when scrolled to top
    if (nearTop && hasMoreMessages && !isLoadingOlderMessages && !isFetchingMessagesRef.current) {
      loadMessages(selectedConversation.id, messagesPage + 1, false);
    }
  }, [selectedConversation, hasMoreMessages, isLoadingOlderMessages, messagesPage, loadMessages]);

  // Send message via WebSocket
  const handleSendMessage = useCallback(() => {
    try {
      console.log('[ChatPage] handleSendMessage called');
      console.log('[ChatPage] messageInput:', messageInput);
      console.log('[ChatPage] selectedConversation:', selectedConversation);
      console.log('[ChatPage] chatSocket:', chatSocket);
      
      if (!messageInput.trim() || !selectedConversation) {
        console.log('[ChatPage] Cannot send - missing input or conversation');
        return;
      }

      if (!chatSocket) {
        toast.error('Đang kết nối WebSocket, vui lòng thử lại');
        console.log('[ChatPage] WebSocket not connected yet');
        return;
      }

      const content = messageInput.trim();
      setMessageInput('');

      // Prepare WebSocket payload
      const payload = {
        toUserId: selectedConversation.id,
        content,
      };

      console.log('[ChatPage] Sending message via WebSocket:', payload);

      // Send via WebSocket - backend will determine fromUserId from auth session
      if (chatSocket.emit) {
        chatSocket.emit('sendChat', payload);
        
        // Optimistically add message to UI
        // Backend will send back real message via 'newChat' event
        const optimisticMessage: ChatMessage = {
          id: `temp-${Date.now()}`,
          fromUserId: 'ADMIN', // Temporary, will be replaced
          toUserId: selectedConversation.id,
          content,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        shouldStickToBottomRef.current = true;
      } else {
        console.error('[ChatPage] Socket does not support emit method');
      }

      // Scroll to bottom
      requestAnimationFrame(() => {
        if (messagesScrollRef.current) {
          messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
        }
      });
    } catch (error) {
      console.error('[ChatPage] Error sending message:', error);
      toast.error('Lỗi khi gửi tin nhắn');
    }
  }, [messageInput, selectedConversation, chatSocket]);

  // Handle incoming message from WebSocket
  const handleIncomingMessage = useCallback((data: ChatMessage) => {
    console.log('[ChatPage] ✅ Received newChat event:', data);
    
    setMessages((prev) => {
      // Check if message already exists by real ID (prevent duplicates)
      const existingIndex = prev.findIndex((msg) => msg.id === data.id);
      if (existingIndex !== -1) {
        console.log('[ChatPage] Message already exists (real ID), skipping');
        return prev;
      }

      // Check if this is a response to our optimistic message
      // Match by content and toUserId (since optimistic has temp ID)
      const optimisticIndex = prev.findIndex(
        (msg) => 
          msg.id.startsWith('temp-') && 
          msg.content === data.content &&
          msg.toUserId === data.toUserId
      );

      if (optimisticIndex !== -1) {
        console.log('[ChatPage] ✅ Replacing optimistic message with real one');
        // Replace optimistic message with real one from backend
        const updated = [...prev];
        updated[optimisticIndex] = data;
        return updated;
      }

      // New message from user or other source
      console.log('[ChatPage] ✅ Adding new message from user');
      return [...prev, data];
    });

    // Scroll to bottom if already at bottom
    if (shouldStickToBottomRef.current) {
      requestAnimationFrame(() => {
        if (messagesScrollRef.current) {
          messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
        }
      });
    }

    // Update conversation list with new last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === data.fromUserId || conv.id === data.toUserId
          ? {
              ...conv,
              lastMessage: data.content,
              lastMessageDate: data.createdAt,
              unread: conv.id === data.fromUserId ? (conv.unread || 0) + 1 : (conv.unread || 0),
            }
          : conv
      )
    );
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const socket = connectChatSocket({ debug: true });
    setChatSocket(socket);

    // Listen for new messages
    const unsubscribe = socket.on('newChat', (data) => {
      console.log('[ChatPage] ✅ Received newChat event:', data);
      handleIncomingMessage(data);
    });
    
    // Listen for connection events
    const unsubConnect = socket.on('connect', () => {
      console.log('[ChatPage] WebSocket connected');
    });
    
    const unsubDisconnect = socket.on('disconnect', () => {
      console.log('[ChatPage] WebSocket disconnected');
    });
    
    const unsubError = socket.on('error', (error: any) => {
      console.error('[ChatPage] WebSocket error:', error);
    });

    return () => {
      unsubscribe();
      unsubConnect();
      unsubDisconnect();
      unsubError();
      socket.close();
    };
  }, [handleIncomingMessage]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations(conversationsPage, searchQuery);
  }, [conversationsPage, searchQuery, loadConversations]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setMessages([]);
      setMessagesPage(1);
      setHasMoreMessages(true);
      loadMessages(selectedConversation.id, 1, true);

      // Mark conversation as read
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id ? { ...conv, unread: 0 } : conv
        )
      );
    }
  }, [selectedConversation, loadMessages]);

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

  const getInitials = (name: string) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0][0] + words[words.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const isMessageFromAdmin = (message: ChatMessage) => {
    // Trong context chat admin-user:
    // - Message từ user: fromUserId === selectedConversation.id (user gửi cho admin)
    // - Message từ admin: fromUserId !== selectedConversation.id (admin gửi cho user)
    // Hoặc check nếu toUserId === selectedConversation.id (admin gửi cho user này)
    
    if (!selectedConversation) return false;
    
    // Check if this message was sent TO the selected user (meaning admin sent it)
    // OR if fromUserId is not the selected user (also means admin sent it)
    return message.toUserId === selectedConversation.id || 
           (message.fromUserId !== selectedConversation.id && message.fromUserId !== null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Quản Lý Chat</h2>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{ height: 'calc(100vh - 12rem)' }}
      >
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          {/* Search Header */}
          <div className="p-4 border-b bg-gray-50 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setConversationsPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-hidden">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Không có cuộc trò chuyện nào</p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors relative ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 border-l-4 border-[#007BFF]'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={
                                conversation.avatarUrl ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.fullName}`
                              }
                            />
                            <AvatarFallback className="bg-[#007BFF] text-white">
                              {getInitials(conversation.fullName)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium truncate">
                              {conversation.fullName}
                            </span>
                            {(conversation.unread || 0) > 0 && (
                              <Badge className="bg-[#007BFF] text-white ml-2 h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-1">
                            {conversation.lastMessage || 'Chưa có tin nhắn mới'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {conversation.lastMessageDate ? getRelativeTime(conversation.lastMessageDate) : ''}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Pagination */}
          <div className="p-3 border-t bg-gray-50 flex-shrink-0">
            <Pagination
              currentPage={conversationsPage}
              totalPages={conversationsTotalPages}
              onPageChange={setConversationsPage}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          selectedConversation.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.fullName}`
                        }
                      />
                      <AvatarFallback className="bg-[#007BFF] text-white">
                        {getInitials(selectedConversation.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedConversation.fullName}</h3>
                    <p className="text-xs text-gray-500">Đang hoạt động</p>
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
                    <DropdownMenuItem>Xem thông tin</DropdownMenuItem>
                    <DropdownMenuItem>Tắt thông báo</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash className="h-4 w-4 mr-2" />
                      Xóa cuộc trò chuyện
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
                                  src={
                                    selectedConversation.avatarUrl ||
                                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.fullName}`
                                  }
                                />
                                <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                  {getInitials(selectedConversation.fullName)}
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
                                <p className="break-words text-sm">{message.content}</p>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-[#007BFF] flex-shrink-0"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 rounded-full border-gray-300 focus:border-[#007BFF]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-[#007BFF] hover:bg-[#0056b3] disabled:bg-gray-300 rounded-full h-10 w-10 p-0 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
                  <Send className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Chào mừng đến với Chat
                </h3>
                <p className="text-sm">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
