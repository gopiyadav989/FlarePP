import React, { useRef, useEffect, useState } from 'react';
import { Search, UserCircle, SendHorizontal, Loader2, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';

const ChatInterface = () => {
  const userState = useSelector(state => state.user);
  const currentUser = userState?.user;
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Refs
  const messagesContainerRef = useRef(null);
  
  // Initial load and polling
  useEffect(() => {
    fetchConversations();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedPartner) {
        fetchMessages();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fetch messages when partner changes
  useEffect(() => {
    if (selectedPartner) {
      fetchMessages();
    }
  }, [selectedPartner]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/messages/conversations', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      } else {
        throw new Error('Invalid conversations response format');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch messages for selected partner
  const fetchMessages = async () => {
    if (!selectedPartner?._id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/messages/conversation/${selectedPartner._id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        
        // Update conversation to mark as read
        setConversations(prev => prev.map(conv => 
          conv._id === selectedPartner._id
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      } else {
        throw new Error('Invalid messages response format');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchLoading(true);
      setError(null);
      
      const response = await fetch(`/api/messages/search-users?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search users: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.users)) {
        setSearchResults(data.users);
      } else {
        throw new Error('Invalid search response format');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Select partner for conversation
  const selectPartner = (partner) => {
    setSelectedPartner(partner);
    setSearchResults([]);
    setSearchQuery('');
    setMessages([]);
    setError(null);
  };
  
  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner?._id || !currentUser?._id || sendingMessage) {
      return;
    }
    
    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);
    
    try {
      setError(null);
      
      // Optimistic update
      const tempMessage = {
        _id: `temp_${Date.now()}`,
        content: messageContent,
        createdAt: new Date().toISOString(),
        isOwn: true,
        sender: {
          _id: currentUser._id,
          name: currentUser.name || currentUser.fullName,
          username: currentUser.username,
          avatar: currentUser.avatar
        }
      };
      
      setMessages(prev => [...prev, tempMessage]);
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedPartner._id,
          content: messageContent
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to send message');
      }
      
      // Replace temp message with real message
      if (data.message) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? data.message : msg
          )
        );
      }
      
      // Refresh conversations to show the new message
      fetchConversations();
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Remove the failed message and restore input
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };
  
  // Handle key press in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Handle key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar - Conversations & Search */}
      <div className="w-1/3 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        {/* Search Section */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center bg-zinc-800 rounded-lg">
            <Search className="ml-3 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-2 bg-transparent outline-none text-white placeholder-zinc-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              disabled={searchLoading}
            />
            {searchLoading && (
              <Loader2 className="mr-3 w-4 h-4 animate-spin text-zinc-500" />
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center">
              <AlertCircle className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mb-6">
              <h3 className="text-zinc-400 text-sm font-medium mb-3">Search Results</h3>
              <div className="space-y-2">
                {searchResults.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center p-3 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                    onClick={() => selectPartner(user)}
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full mr-3 object-cover" 
                      />
                    ) : (
                      <UserCircle className="w-10 h-10 text-zinc-400 mr-3" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {user.name || user.fullName}
                      </p>
                      <p className="text-zinc-400 text-sm truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversations */}
          <div>
            <h3 className="text-zinc-400 text-sm font-medium mb-3">Recent Conversations</h3>
            {loading && conversations.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <div
                    key={conv._id}
                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPartner?._id === conv._id 
                        ? 'bg-zinc-800 border border-zinc-700' 
                        : 'hover:bg-zinc-800'
                    }`}
                    onClick={() => selectPartner(conv)}
                  >
                    {conv.avatar ? (
                      <img 
                        src={conv.avatar} 
                        alt={conv.name} 
                        className="w-10 h-10 rounded-full mr-3 object-cover" 
                      />
                    ) : (
                      <UserCircle className="w-10 h-10 text-zinc-400 mr-3" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium truncate">
                          {conv.name || conv.fullName}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-zinc-400 text-sm truncate">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-500 text-sm">No conversations yet</p>
                <p className="text-zinc-600 text-xs mt-1">Search for users to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedPartner ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b border-zinc-800 bg-zinc-900">
              {selectedPartner.avatar ? (
                <img
                  src={selectedPartner.avatar}
                  alt={selectedPartner.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
              ) : (
                <UserCircle className="w-10 h-10 text-zinc-400 mr-3" />
              )}
              <div>
                <p className="text-white font-medium">
                  {selectedPartner.name || selectedPartner.fullName}
                </p>
                <p className="text-zinc-400 text-sm">
                  @{selectedPartner.username}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 bg-zinc-950"
              ref={messagesContainerRef}
            >
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isFromCurrentUser = msg.isOwn || 
                      (msg.sender && currentUser && 
                       (typeof msg.sender === 'string' ? msg.sender : msg.sender._id) === currentUser._id);
                    
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-lg ${
                            isFromCurrentUser 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-zinc-800 text-white'
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  <div className="text-center">
                    <UserCircle className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
                    <p>No messages yet</p>
                    <p className="text-sm text-zinc-600 mt-1">Start a conversation!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <textarea
                    placeholder="Type a message..."
                    className="w-full p-3 bg-zinc-800 rounded-lg text-white outline-none resize-none placeholder-zinc-500 min-h-[44px] max-h-32"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={sendingMessage}
                    rows={1}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <SendHorizontal className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 bg-zinc-950">
            <UserCircle className="w-20 h-20 mb-4 text-zinc-600" />
            <p className="text-lg mb-2">Welcome to Chat</p>
            <p className="text-sm text-zinc-600">Select a conversation or search for users to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;