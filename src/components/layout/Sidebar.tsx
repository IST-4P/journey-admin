import { AlertCircle, Bell, BookOpen, Car, ChevronDown, ChevronRight, CreditCard, FileText, LayoutDashboard, MessageSquare, Package, Settings, Star, Users, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  path?: string;
  label: string;
  icon: React.ElementType;
  children?: { path: string; label: string; icon: React.ElementType }[];
}

export function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/users', label: 'Người Dùng', icon: Users },
    {
      label: 'Thuê Phương Tiện',
      icon: Car,
      children: [
        { path: '/vehicles', label: 'Phương Tiện', icon: Car },
        { path: '/vehicle-rentals', label: 'Đơn Thuê', icon: FileText },
      ],
    },
    {
      label: 'Thuê Thiết Bị',
      icon: Wrench,
      children: [
        { path: '/equipment', label: 'Thiết Bị', icon: Package },
        { path: '/equipment-rentals', label: 'Đơn Thuê', icon: FileText },
      ],
    },
    { path: '/reviews', label: 'Đánh Giá', icon: Star },
    { path: '/posts', label: 'Bài Viết', icon: BookOpen },
    {
      label: 'Thanh Toán',
      icon: CreditCard,
      children: [
        { path: '/payments', label: 'Đơn Thanh Toán', icon: CreditCard },
        { path: '/refunds', label: 'Hoàn Tiền', icon: FileText },
        { path: '/transactions', label: 'Giao Dịch', icon: FileText },
      ],
    },
    { path: '/notifications', label: 'Thông Báo', icon: Bell },
    { path: '/chat', label: 'Chat', icon: MessageSquare },
    { path: '/complaints', label: 'Khiếu Nại', icon: AlertCircle },
    { path: '/system', label: 'Hệ Thống', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);
  
  const isParentActive = (children: { path: string }[]) => {
    return children.some(child => location.pathname.startsWith(child.path));
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 z-30 overflow-y-auto ${
          isOpen ? 'w-64' : 'w-0 lg:w-16'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            // Item with children (expandable)
            if (item.children) {
              const isExpanded = expandedItems.includes(item.label);
              const hasActiveChild = isParentActive(item.children);

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors ${
                      hasActiveChild
                        ? 'bg-blue-50 text-[#007BFF]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={!isOpen ? item.label : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 flex-shrink-0 ${hasActiveChild ? 'text-[#007BFF]' : 'text-gray-600'}`} />
                      <span
                        className={`transition-opacity duration-300 whitespace-nowrap ${
                          isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {isOpen && (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 flex-shrink-0" />
                      )
                    )}
                  </button>

                  {/* Submenu */}
                  {isOpen && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = isActive(child.path);

                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                              childActive
                                ? 'bg-blue-50 text-[#007BFF]'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <ChildIcon className={`h-4 w-4 flex-shrink-0 ${childActive ? 'text-[#007BFF]' : 'text-gray-500'}`} />
                            <span className="whitespace-nowrap">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Regular item without children
            const active = item.path ? isActive(item.path) : false;

            return (
              <Link
                key={item.path}
                to={item.path!}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                  active
                    ? 'bg-blue-50 text-[#007BFF]'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-[#007BFF]' : 'text-gray-600'}`} />
                <span
                  className={`transition-opacity duration-300 whitespace-nowrap ${
                    isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-0'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
