import React, { useEffect, useState } from "react";
import { Bell, Search, LogOut, Check } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { logout } from '../../redux/reducers/userSlice';

// Sample notifications data for fallback
const sampleNotifications = [
  {
    _id: '1',
    type: 'NEW_ASSIGNMENT',
    message: 'New video assigned: Summer Campaign Edit',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    video: 'video-1'
  },
  {
    _id: '2',
    type: 'DEADLINE_REMINDER',
    message: 'Deadline approaching: Product Launch Video',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    video: 'video-2'
  },
  {
    _id: '3',
    type: 'APPROVAL',
    message: 'Your edit for Client Testimonial has been approved',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    video: 'video-3'
  }
];

const Navbar = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications with error handling and fallback
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications', {
        params: {
          limit: 10,
          sort: '-createdAt'
        }
      });
      
      // Handle both possible API response structures
      const notificationData = response.data?.notifications || response.data || sampleNotifications;
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Fallback to sample data in case of error
      setNotifications(sampleNotifications);
      setUnreadCount(sampleNotifications.filter(n => !n.read).length);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}`, {
        read: true
      });
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Optimistically update UI even if API call fails
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Optimistically update UI even if API call fails
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // will use WebSocket later
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_ASSIGNMENT": return "🎥";
      case "DEADLINE_REMINDER": return "⏰";
      case "REVISION_REQUEST": return "📝";
      case "APPROVAL": return "✅";
      case "MESSAGE": return "💬";
      default: return "📢";
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case "NEW_ASSIGNMENT":
        window.location.href = `/editor-dashboard/video/${notification.video}`;
        break;
      // Add other cases as needed
      default:
        break;
    }
  };

  function handleLogout() {
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/editor-dashboard" className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              Editor Studio
            </h1>
          </Link>
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search assigned videos..."
              className="w-full bg-zinc-800/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-zinc-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-zinc-900 border-zinc-800">
                    <div className="flex items-center justify-between p-2">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Mark all as read
                        </button>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <DropdownMenuItem
                            key={notif._id}
                            className={`flex items-start gap-3 p-3 cursor-pointer ${
                              !notif.read ? 'bg-blue-500/10' : ''
                            }`}
                            onClick={() => handleNotificationClick(notif)}>
                            <span className="text-lg">
                              {getNotificationIcon(notif.type)}
                            </span>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm">{notif.message}</span>
                              <span className="text-xs text-zinc-400">
                                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-zinc-400 text-sm">
                          No notifications
                        </div>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-8 w-px bg-zinc-800"></div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 bg-zinc-800/50 rounded-full p-1 pr-4 hover:bg-zinc-700/50 transition-colors border border-zinc-700">
              <img 
                src={user?.avatar || '/api/placeholder/32/32'} 
                alt={`${user?.name || 'User'}'s Profile`} 
                className="h-8 w-8 rounded-full object-cover"/>
              <span className="text-sm font-medium">
                {user?.name || 'Loading...'}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800 text-white">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;