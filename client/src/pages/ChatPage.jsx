import React, { useRef, useEffect, useState } from 'react';
import { Search, UserCircle, SendHorizontal, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useSocket } from '../hooks/SocketContext';

const Messages = () => {
  // Get user from Redux
  const userState = useSelector(state => state.user);
  const currentUser = userState?.user;
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // WebSocket context
  const { 
    connected, 
    onlineUsers, 
    sendMessage: sendSocketMessage,
    sendTyping: sendTypingStatus,
    getUserStatuses,
    registerMessageHandler,
    registerTypingHandler
  } = useSocket();
  
  // Add after useState declarations:
  const typingTimeoutRef = useRef(null);
  
  useEffect(() => {
    fetchConversations();
    
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedPartner) {
        fetchMessages();
      }
    }, 50000);
    
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
  
  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/messages/conversations', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Conversations response:', data);
      
      if (Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      } else {
        console.error('Invalid conversations format:', data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch messages
  const fetchMessages = async () => {
    if (!selectedPartner?._id) return;
    
    try {
      setLoading(true);
      console.log(`Fetching messages for partner: ${selectedPartner._id}`);
      
      const response = await fetch(`http://localhost:3000/api/messages/conversation/${selectedPartner._id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Messages response:', data);
      
      if (data.success && Array.isArray(data.messages)) {
        // Track message IDs we've already seen to avoid duplicates
        const messageIds = new Set();
        const uniqueMessages = [];
        
        data.messages.forEach(msg => {
          if (!messageIds.has(msg._id)) {
            messageIds.add(msg._id);
            uniqueMessages.push(msg);
          }
        });
        
        console.log(`Setting ${uniqueMessages.length} messages`);
        setMessages(uniqueMessages);
        
        // Update conversation in list to mark as read
        setConversations(prev => prev.map(conv => 
          conv._id === selectedPartner._id
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
      } else {
        console.error('Invalid messages format:', data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };
  
  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/messages/search-users?q=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data);
      
      if (Array.isArray(data.users)) {
        setSearchResults(data.users);
      } else {
        console.error('Invalid search results format:', data);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };
  
  // Select partner
  const selectPartner = (partner) => {
    console.log('Selecting partner:', partner);
    setSelectedPartner(partner);
    setSearchResults([]);
    setSearchQuery('');
    
    // Get user status 
    if (connected) {
      getUserStatuses([partner._id]);
    }
  };
  
  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner?._id || !currentUser?._id) return;
    
    try {
      console.log(`Sending message to ${selectedPartner._id}: "${newMessage}"`);
      
      // Generate a temporary ID for optimistic updates
      const tempId = `temp_${Date.now()}`;
      
      // Optimistic update
      setMessages(prev => [...prev, {
        _id: tempId,
        content: newMessage,
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
        sender: {
          _id: currentUser._id
        },
        tempId // Add tempId for tracking
      }]);
      
      // Clear the input
      setNewMessage('');
      
      // Try to send via WebSocket first
      let socketSent = false;
      if (connected) {
        socketSent = sendSocketMessage(selectedPartner._id, newMessage, tempId);
      }
      
      // If WebSocket fails, or not connected, use REST API
      if (!socketSent) {
        const response = await fetch('http://localhost:3000/api/messages/send', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            recipientId: selectedPartner._id,
            content: newMessage,
            tempId
          })
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Send message response:', data);
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to send message');
        }
        
        // Update the temporary message with the real one
        setMessages(prev => 
          prev.map(msg => 
            msg._id === tempId || msg.tempId === tempId ? data.message : msg
          )
        );
      }
      
      // Update conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg._id !== tempId && msg.tempId !== tempId));
    }
  };

  // Add this useEffect to register message handlers:
  useEffect(() => {
    // Register handlers for new messages
    registerMessageHandler((message) => {
      console.log('New socket message received:', message);
      
      // Only add the message if it's from the current conversation
      if (
        selectedPartner && 
        (message.sender._id === selectedPartner._id || message.receiver._id === selectedPartner._id)
      ) {
        setMessages(prev => [...prev, message]);
        
        // Update conversation in list to mark as read
        setConversations(prev => prev.map(conv => 
          conv._id === message.sender._id
            ? { 
                ...conv, 
                lastMessage: message.content,
                timestamp: message.timestamp
              }
            : conv
        ));
      } else {
        // If not in current conversation, refresh the conversations list
        fetchConversations();
      }
    });
    
    // Register handler for typing status
    registerTypingHandler((userId, isTyping) => {
      if (selectedPartner && userId === selectedPartner._id) {
        setTyping(prev => ({ ...prev, [userId]: isTyping }));
      }
    });
    
    return () => {
      // No cleanup needed since registrations are stored in the context
    };
  }, [selectedPartner]);

  // Add this useEffect for typing indication:
  useEffect(() => {
    if (!selectedPartner || !connected) return;
    
    if (newMessage.trim()) {
      // Send typing status
      sendTypingStatus(selectedPartner._id, true);
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(selectedPartner._id, false);
      }, 3000);
    } else {
      // Message is empty, stop typing
      sendTypingStatus(selectedPartner._id, false);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [newMessage, selectedPartner, connected]);

  // Add this in your render function, before the Messages section:
  const [typing, setTyping] = useState({});

  if (loading && !conversations.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar - Conversations & Search */}
      <div className="w-1/3 border-r border-zinc-800 bg-zinc-900 p-4 overflow-y-auto">
        <div className="flex items-center mb-4 bg-zinc-800 rounded-lg">
          <Search className="ml-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 bg-transparent outline-none text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-zinc-500 mb-2">Search Results</h3>
            {searchResults.map(user => (
              <div
                key={user._id}
                className="flex items-center p-2 hover:bg-zinc-800 rounded-lg cursor-pointer"
                onClick={() => selectPartner(user)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                ) : (
                  <UserCircle className="w-10 h-10 text-zinc-400 mr-3" />
                )}
                <div>
                  <p className="text-white">{user.name}</p>
                  <p className="text-zinc-500 text-sm">@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Conversations */}
        <div>
          <h3 className="text-zinc-500 mb-2">Conversations</h3>
          {conversations.length > 0 ? (
            conversations.map(conv => (
              <div
                key={conv._id}
                className={`flex items-center p-2 rounded-lg cursor-pointer ${
                  selectedPartner?._id === conv._id ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                }`}
                onClick={() => selectPartner(conv)}
              >
                {conv.avatar ? (
                  <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full mr-3" />
                ) : (
                  <UserCircle className="w-10 h-10 text-zinc-400 mr-3" />
                )}
                <div className="flex-1">
                  <p className="text-white">{conv.name}</p>
                  <p className="text-zinc-500 text-sm truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                    {conv.unreadCount}
                  </span>
                )}
                <div className={`w-3 h-3 rounded-full ${onlineUsers[conv._id] === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
              </div>
            ))
          ) : (
            <p className="text-zinc-500 italic">No conversations yet</p>
          )}
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
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <UserCircle className="w-10 h-10 text-zinc-400 mr-3" />
              )}
              <div>
                <p className="text-white">{selectedPartner.name || selectedPartner.fullName}</p>
                <p className="text-zinc-500 text-sm">@{selectedPartner.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 bg-zinc-950"
              ref={messagesContainerRef}
            >
              {messages.length > 0 ? (
                messages.map((msg) => {
                  
                  let isFromCurrentUser = false;
                  
                  // Check the explicit flag first
                  if (msg.isCurrentUser === true) {
                    isFromCurrentUser = true;
                  }

                  else if (msg.sender && currentUser) {
                    const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender._id;
                    if (senderId === currentUser._id) {
                      isFromCurrentUser = true;
                      console.log('Message is from current user based on ID comparison');
                    }
                  }
                  

                  
                  return (
                    <div
                      key={msg._id}
                      className={`flex mb-4 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md p-3 rounded-lg ${
                          isFromCurrentUser ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-white'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="flex items-center p-4 bg-zinc-900 border-t border-zinc-800">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 bg-zinc-800 rounded-lg mr-2 text-white outline-none"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full"
                disabled={!newMessage.trim()}
              >
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Typing Indicator */}
            {typing[selectedPartner?._id] && (
              <div className="flex justify-start mb-4">
                <div className="bg-zinc-800 text-white p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <UserCircle className="w-16 h-16 mb-4" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;