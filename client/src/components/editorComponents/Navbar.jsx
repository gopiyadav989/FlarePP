import React, { useEffect, useState } from "react";
import { Bell, Search, LogOut, Check, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
    type: 'VIDEO_ASSIGNED',
    message: 'New video assigned: Summer Campaign Edit',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    relatedVideo: 'video-1'
  },
  {
    _id: '2',
    type: 'VIDEO_REJECTED',
    message: 'Video rejected: Product Launch Video needs revision',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    relatedVideo: 'video-2'
  },
  {
    _id: '3',
    type: 'VIDEO_APPROVED',
    message: 'Your edit for Client Testimonial has been approved',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    relatedVideo: 'video-3'
  }
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications with error handling and fallback
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      
      // Expect the response format: { success: true, notifications: [...], unreadCount: number }
      if (response.data && response.data.success === true) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        console.log('Unexpected API response format:', response.data);
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
      // Show empty state on error
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.post('/api/notifications/mark-read', {
        notificationIds: [notificationId]
      });
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log('Error marking notification as read:', error);
      // Optimistically update UI even if API call fails
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Error marking all notifications as read:', error);
      // Optimistically update UI even if API call fails
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for notifications every minute
    const interval = setInterval(fetchNotifications, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "VIDEO_ASSIGNED": return "🎥";
      case "VIDEO_REJECTED": return "🔄";
      case "VIDEO_APPROVED": return "✅";
      case "VIDEO_PUBLISHED": return "🚀";
      default: return "📢";
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case "VIDEO_ASSIGNED":
      case "VIDEO_REJECTED":
      case "VIDEO_APPROVED":
      case "VIDEO_PUBLISHED":
        if (notification.relatedVideo) {
          window.location.href = `/editor-dashboard/video/${notification.relatedVideo}`;
        }
        break;
      default:
        // Use link field if available
        if (notification.link) {
          window.location.href = notification.link;
        }
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
                              !notif.isRead ? 'bg-blue-500/10' : ''
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

          <Tooltip>
            <TooltipTrigger>
              <Link
                to="/chat"
                className="p-2 rounded-full hover:bg-zinc-800 transition-colors inline-block"
              >
                <MessageCircle className="h-5 w-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat with Creators</p>
            </TooltipContent>
          </Tooltip>

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