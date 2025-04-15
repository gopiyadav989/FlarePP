import React, { useState, useEffect } from "react";
import { Bell, Search, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProfileDropdown from "./ProfileDropDown";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
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

// Sample notifications data for fallback
const sampleNotifications = [
  {
    _id: '1',
    type: 'EDITOR_ASSIGNED',
    message: 'Editor John Doe has been assigned to your video',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    video: 'video-1'
  },
  {
    _id: '2',
    type: 'EDIT_COMPLETED',
    message: 'Your video "Marketing Campaign" has been edited',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    video: 'video-2'
  },
  {
    _id: '3',
    type: 'COMMENT_ADDED',
    message: 'New comment on your video "Product Launch"',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    video: 'video-3'
  }
];

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications with error handling and fallback
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      
      // Extract the notifications array from the response
      let notificationData;
      
      // Handle different response formats
      if (response.data && response.data.success === true) {
        // If the response follows the { success: true, notifications: [...] } format
        notificationData = response.data.notifications || [];
        setUnreadCount(response.data.unreadCount || 0);
      } else {
        // Otherwise assume it's just the array directly
        notificationData = Array.isArray(response.data) ? response.data : [];
        // Calculate unread count
        setUnreadCount(notificationData.filter(n => n && !n.isRead).length);
      }
      
      // Set notifications
      setNotifications(notificationData);
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
        isRead: true
      });
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      await axios.patch('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
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
      case "EDITOR_ASSIGNED": return "👤";
      case "EDIT_COMPLETED": return "✅";
      case "REVISION_REQUESTED": return "🔄";
      case "COMMENT_ADDED": return "💬";
      case "FEEDBACK_RECEIVED": return "📝";
      default: return "📢";
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    // Navigate to relevant page based on notification type
    switch (notification.type) {
      case "EDITOR_ASSIGNED":
      case "EDIT_COMPLETED":
      case "COMMENT_ADDED":
        navigate(`/creator-dashboard/video/${notification.relatedVideo}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/95 backdrop-blur-xl">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button
            variant="link"
            onClick={() => navigate("/creator-dashboard")}
            className="text-white text-xl font-bold hover:text-zinc-200 transition-colors px-0"
          >
            Creator Studio
          </Button>

          <div
            className={`relative w-72 transition-all duration-200 ${
              isSearchFocused ? "w-96" : "w-72"
            }`}
            onClick={() => navigate("/creator-dashboard/search")}
          >
            <div
              className={`w-full bg-zinc-900 hover:bg-zinc-900/90 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-400 
                transition-all duration-200 border border-zinc-900
                ${isSearchFocused ? "border-zinc-800 bg-zinc-900" : ""}`}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            >
              Search videos...
            </div>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger className="relative p-2 rounded-xl hover:bg-zinc-900 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
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
                          className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1">
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
                              !notif.isRead ? 'bg-red-500/10' : ''
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
          <div className="h-8 w-px bg-zinc-900" />
          <ProfileDropdown>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 rounded-xl hover:bg-zinc-900 transition-colors pl-2 pr-3"
            >
              <div className="relative">
                <img
                  src={user?.avatar || "/api/placeholder/32/32"}
                  alt={`${user?.name}'s Profile`}
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full ring-2 ring-zinc-950" />
              </div>
              <span className="text-sm font-medium text-zinc-200">
                {user?.name || "Loading..."}
              </span>
            </Button>
          </ProfileDropdown>
        </div>
      </div>
    </div>
  );
};

export default Navbar;