import {
  Loader2,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Trash,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { Pagination } from "../../components/common/Pagination";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { chatService } from "../../lib/services/chat.service";
import { ChatMessage, Conversation } from "../../lib/types/chat";

const CONVERSATIONS_PER_PAGE = 15;
const MESSAGES_PER_PAGE = 20;

// Extended Conversation type for UI state
interface ConversationWithState extends Conversation {
  lastMessage?: string;
  lastMessageAt?: string;
  unread?: number;
}

export function ChatPage() {
  // Conversations state
  const [conversations, setConversations] = useState<ConversationWithState[]>(
    []
  );
  const [conversationsPage, setConversationsPage] = useState(1);
  const [conversationsTotalPages, setConversationsTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  // Chat state
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithState | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  // WebSocket - Simplified like test-chat.html
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // WebSocket for chat-list (conversations)
  const [socketChatList, setSocketChatList] = useState<Socket | null>(null);
  const [isSocketChatListConnected, setIsSocketChatListConnected] =
    useState(false);

  // Refs
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const isFetchingMessagesRef = useRef(false);
  const shouldStickToBottomRef = useRef(true);

  // Load conversations
  const loadConversations = useCallback(
    async (page: number, search: string = "") => {
      setIsLoadingConversations(true);
      try {
        const response = await chatService.getManyConversations({
          page,
          limit: CONVERSATIONS_PER_PAGE,
        });

        const conversations = response.conversations || [];
        const totalPages = response.totalPages || 1;

        let filteredConversations = conversations as ConversationWithState[];

        if (search) {
          filteredConversations = filteredConversations.filter((conv) =>
            conv.fullName.toLowerCase().includes(search.toLowerCase())
          );
        }

        setConversations(filteredConversations);
        setConversationsTotalPages(totalPages);
      } catch (error) {
        console.error("Failed to load conversations:", error);
        toast.error("Không thể tải danh sách cuộc trò chuyện");
      } finally {
        setIsLoadingConversations(false);
      }
    },
    []
  );

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

        console.log("[ChatPage] Raw messages response:", response);

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
              messagesScrollRef.current.scrollTop =
                messagesScrollRef.current.scrollHeight;
            }
          });
        } else {
          // Loading older messages - prepend to beginning
          const scrollContainer = messagesScrollRef.current;
          const prevScrollHeight = scrollContainer?.scrollHeight ?? 0;
          const prevScrollTop = scrollContainer?.scrollTop ?? 0;

          setMessages((prev) => {
            const existingIds = new Set(prev.map((msg) => msg.id));
            const uniqueNew = newMessages.filter(
              (msg) => !existingIds.has(msg.id)
            );
            // Prepend older messages to the beginning
            return [...uniqueNew, ...prev];
          });

          setMessagesPage(page);
          setHasMoreMessages(chats.length === MESSAGES_PER_PAGE);

          // Maintain scroll position
          requestAnimationFrame(() => {
            if (scrollContainer) {
              const newScrollHeight = scrollContainer.scrollHeight;
              scrollContainer.scrollTop =
                newScrollHeight - prevScrollHeight + prevScrollTop;
            }
          });
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
        toast.error("Không thể tải tin nhắn");
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
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    shouldStickToBottomRef.current = nearBottom;

    // Load older messages when scrolled to top
    if (
      nearTop &&
      hasMoreMessages &&
      !isLoadingOlderMessages &&
      !isFetchingMessagesRef.current
    ) {
      loadMessages(selectedConversation.userId, messagesPage + 1, false);
    }
  }, [
    selectedConversation,
    hasMoreMessages,
    isLoadingOlderMessages,
    messagesPage,
    loadMessages,
  ]);

  // Send message - Giống test-chat.html
  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedConversation || !socket) {
      if (!socket) {
        toast.error("WebSocket chưa kết nối");
      }
      return;
    }

    if (!socket.connected) {
      toast.error("WebSocket đã ngắt kết nối, vui lòng đợi...");
      return;
    }

    const content = messageInput.trim();
    setMessageInput("");

    // Payload giống test-chat.html
    const message = {
      toUserId: selectedConversation.userId,
      content: content,
    };

    console.log("[Chat] 📤 Sending message:", message);
    socket.emit("sendChat", message);

    // Scroll to bottom
    requestAnimationFrame(() => {
      if (messagesScrollRef.current) {
        messagesScrollRef.current.scrollTop =
          messagesScrollRef.current.scrollHeight;
      }
    });
  }, [messageInput, selectedConversation, socket]);

  // Handle incoming message - Giống test-chat.html
  const handleNewMessage = useCallback((data: ChatMessage) => {
    console.log("[Chat] 📨 Received newChat:", data);

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
          messagesScrollRef.current.scrollTop =
            messagesScrollRef.current.scrollHeight;
        }
      });
    }

    // Update conversation list
    setConversations((prev) =>
      prev.map((conv) => {
        const isRelated =
          conv.userId === data.fromUserId || conv.userId === data.toUserId;

        if (isRelated) {
          // Format time as HH:MM
          const messageDate = new Date(data.createdAt);
          const formattedTime = messageDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });

          return {
            ...conv,
            lastMessage: data.content,
            lastMessageAt: formattedTime,
            unread:
              conv.userId === data.fromUserId
                ? (conv.unread || 0) + 1
                : conv.unread || 0,
          };
        }
        return conv;
      })
    );
  }, []);

  // Initialize WebSocket - Giống test-chat.html
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:3000";
    const namespace = "/chat";

    console.log("[Chat] 🔌 Connecting WebSocket to:", `${wsUrl}${namespace}`);
    console.log(
      "[Chat] 🍪 Using httpOnly cookies (sent automatically by browser)"
    );

    // Socket.IO options
    // QUAN TRỌNG: Với httpOnly cookies, KHÔNG thể đọc bằng document.cookie
    // Browser sẽ TỰ ĐỘNG gửi cookies qua HTTP headers khi withCredentials: true
    const socketOptions: any = {
      withCredentials: true, // Browser tự động gửi httpOnly cookies
      transports: ["websocket", "polling"],
    };

    console.log(
      "[Chat] ✅ Browser will automatically send httpOnly cookies with requests"
    );

    const socketInstance = io(`${wsUrl}${namespace}`, socketOptions);
    setSocket(socketInstance);

    // Lắng nghe events
    socketInstance.on("connect", () => {
      console.log(
        "[Chat] ✅ WebSocket connected! Socket ID:",
        socketInstance.id
      );
      setIsSocketConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Chat] ❌ WebSocket disconnected. Reason:", reason);
      setIsSocketConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[Chat] ❌ Connection error:", error.message);
      setIsSocketConnected(false);
    });

    // Lắng nghe event 'newChat' - QUAN TRỌNG
    socketInstance.on("newChat", (data: ChatMessage) => {
      console.log("[Chat] 📨 New chat message:", data);
      handleNewMessage(data);
    });

    // Cleanup
    return () => {
      console.log("[Chat] 🔌 Disconnecting WebSocket...");
      socketInstance.disconnect();
    };
  }, [handleNewMessage]);

  // Initialize WebSocket for chat-list namespace
  useEffect(() => {
    const wsAdminUrl =
      import.meta.env.VITE_WS_ADMIN_URL || "http://localhost:3100";
    const namespace = "/chat-list";

    console.log(
      "[ChatList] 🔌 Connecting WebSocket to:",
      `${wsAdminUrl}${namespace}`
    );
    console.log(
      "[ChatList] 🍪 Using httpOnly cookies (sent automatically by browser)"
    );

    const socketOptions: any = {
      withCredentials: true, // Browser tự động gửi httpOnly cookies
      transports: ["websocket", "polling"],
    };

    const socketChatListInstance = io(
      `${wsAdminUrl}${namespace}`,
      socketOptions
    );
    setSocketChatList(socketChatListInstance);

    // Lắng nghe events
    socketChatListInstance.on("connect", () => {
      console.log(
        "[ChatList] ✅ WebSocket connected! Socket ID:",
        socketChatListInstance.id
      );
      setIsSocketChatListConnected(true);
    });

    socketChatListInstance.on("disconnect", (reason) => {
      console.log("[ChatList] ❌ WebSocket disconnected. Reason:", reason);
      setIsSocketChatListConnected(false);
    });

    socketChatListInstance.on("connect_error", (error) => {
      console.error("[ChatList] ❌ Connection error:", error.message);
      setIsSocketChatListConnected(false);
    });

    // Lắng nghe event 'conversationsRefreshed'
    socketChatListInstance.on(
      "conversationsRefreshed",
      (data: {
        conversations: ConversationWithState[];
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
      }) => {
        console.log("[ChatList] 📨 Conversations refreshed:", data);

        // Cập nhật conversations state
        const conversations = data.conversations || [];
        const totalPages = data.totalPages || 1;

        let filteredConversations = conversations;

        // Áp dụng search filter nếu có
        if (searchQuery) {
          filteredConversations = filteredConversations.filter((conv) =>
            conv.fullName.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setConversations(filteredConversations);
        setConversationsTotalPages(totalPages);
      }
    );

    // Cleanup
    return () => {
      console.log("[ChatList] 🔌 Disconnecting WebSocket...");
      socketChatListInstance.disconnect();
    };
  }, [searchQuery]);

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
      loadMessages(selectedConversation.userId, 1, true);

      // Mark conversation as read
      setConversations((prev) =>
        prev.map((conv) =>
          conv.userId === selectedConversation.userId
            ? { ...conv, unread: 0 }
            : conv
        )
      );
    }
  }, [selectedConversation, loadMessages]);

  // Helper functions
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getInitials = (name: string) => {
    const words = name.split(" ");
    if (words.length >= 2) {
      return words[0][0] + words[words.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const isMessageFromAdmin = (message: ChatMessage) => {
    // Trong context chat admin-user:
    // - Message từ user: fromUserId === selectedConversation.userId (user gửi cho admin)
    // - Message từ admin: fromUserId !== selectedConversation.userId (admin gửi cho user)
    // Hoặc check nếu toUserId === selectedConversation.userId (admin gửi cho user này)

    if (!selectedConversation) return false;

    // Check if this message was sent TO the selected user (meaning admin sent it)
    // OR if fromUserId is not the selected user (also means admin sent it)
    return (
      message.toUserId === selectedConversation.userId ||
      (message.fromUserId !== selectedConversation.userId &&
        message.fromUserId !== null)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Quản Lý Chat</h2>

        {/* WebSocket Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isSocketConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-gray-600">
            {isSocketConnected
              ? "Đã kết nối WebSocket"
              : "Chưa kết nối WebSocket"}
          </span>
        </div>
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        style={{ height: "calc(100vh - 12rem)" }}
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
                      key={conversation.userId}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors relative ${
                        selectedConversation?.userId === conversation.userId
                          ? "bg-blue-50 border-l-4 border-[#007BFF]"
                          : ""
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
                            {conversation.lastMessage || "Chưa có tin nhắn mới"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {conversation.lastMessageAt
                              ? formatTime(conversation.lastMessageAt)
                              : ""}
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
                    <h3 className="font-medium">
                      {selectedConversation.fullName}
                    </h3>
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
                        new Date(
                          messages[index - 1].createdAt
                        ).toDateString() !==
                          new Date(message.createdAt).toDateString();

                      return (
                        <div key={message.id}>
                          {/* Date separator */}
                          {showDateSeparator && (
                            <div className="flex items-center justify-center my-4">
                              <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                                {new Date(message.createdAt).toLocaleDateString(
                                  "vi-VN",
                                  {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </div>
                            </div>
                          )}

                          {/* Message bubble */}
                          <div
                            className={`flex items-end gap-2 ${
                              isFromAdmin ? "justify-end" : "justify-start"
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
                                    ? "bg-[#007BFF] text-white rounded-br-none"
                                    : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                                }`}
                              >
                                <p className="break-words text-sm">
                                  {message.content}
                                </p>
                              </div>
                              <div
                                className={`flex items-center gap-1 mt-1 px-2 ${
                                  isFromAdmin ? "self-end" : "self-start"
                                }`}
                              >
                                <p className="text-xs text-gray-400">
                                  {formatTime(message.createdAt)}
                                </p>
                                {isFromAdmin && (
                                  <span className="text-xs text-gray-400">
                                    ✓
                                  </span>
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
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 rounded-full border-gray-300 focus:border-[#007BFF]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || !isSocketConnected}
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
                <p className="text-sm">
                  Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
