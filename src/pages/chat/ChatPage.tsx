import { Send, Trash, Search, Paperclip, MoreVertical, Circle } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '../../components/common/Pagination';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { ScrollArea } from '../../components/ui/scroll-area';
import { generateMockMessages, mockConversations } from '../../lib/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';

const ITEMS_PER_PAGE = 15;

export function ChatPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination for conversations
  const filteredConversations = mockConversations.filter((conv) =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredConversations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedConversations = filteredConversations.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const messages = selectedConversation ? generateMockMessages(selectedConversation) : [];
  const selectedConv = mockConversations.find((c) => c.id === selectedConversation);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, send message to backend
      setMessageInput('');
    }
  };

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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Quản Lý Chat</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" style={{ height: 'calc(100vh - 12rem)' }}>
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
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="divide-y">
                {paginatedConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors relative ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-[#007BFF]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.userName}`} />
                          <AvatarFallback className="bg-[#007BFF] text-white">
                            {getInitials(conversation.userName)}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.id % 3 === 0 && (
                          <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">{conversation.userName}</span>
                          {conversation.unread > 0 && (
                            <Badge className="bg-[#007BFF] text-white ml-2 h-5 min-w-[20px] flex items-center justify-center rounded-full px-1.5">
                              {conversation.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mb-1">{conversation.lastMessage}</p>
                        <p className="text-xs text-gray-400">
                          {getRelativeTime(conversation.lastMessageDate)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t bg-gray-50 flex-shrink-0">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow flex flex-col overflow-hidden">
          {selectedConversation && selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.userName}`} />
                      <AvatarFallback className="bg-[#007BFF] text-white">
                        {getInitials(selectedConv.userName)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedConv.id % 3 === 0 && (
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedConv.userName}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedConv.id % 3 === 0 ? 'Đang hoạt động' : 'Offline'}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-[#007BFF]">
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
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {messages.map((message, index) => (
                      <div key={message.id}>
                        {/* Date separator */}
                        {(index === 0 || 
                          new Date(messages[index - 1].timestamp).toDateString() !== 
                          new Date(message.timestamp).toDateString()) && (
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                              {new Date(message.timestamp).toLocaleDateString('vi-VN', {
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
                            message.sender === 'admin' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          {message.sender === 'user' && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.userName}`} />
                              <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                                {getInitials(selectedConv.userName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${
                              message.sender === 'admin'
                                ? 'bg-[#007BFF] text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <p
                                className={`text-xs ${
                                  message.sender === 'admin'
                                    ? 'text-blue-100'
                                    : 'text-gray-400'
                                }`}
                              >
                                {formatTime(message.timestamp)}
                              </p>
                              {message.sender === 'admin' && (
                                <span className="text-xs text-blue-100">✓✓</span>
                              )}
                            </div>
                          </div>
                          {message.sender === 'admin' && (
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback className="bg-[#007BFF] text-white text-xs">
                                AD
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {selectedConv.id % 5 === 0 && (
                      <div className="flex items-end gap-2">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConv.userName}`} />
                          <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                            {getInitials(selectedConv.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Message Input - Fixed at Bottom */}
              <div className="p-4 border-t bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#007BFF] flex-shrink-0">
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
