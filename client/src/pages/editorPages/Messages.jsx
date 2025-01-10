import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, UserCircle, SendHorizontal, Loader2 } from 'lucide-react';

const Messages = () => {
  // Initialize state with empty arrays to prevent mapping errors
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startPolling = (partnerId) => {
    if (!partnerId) return; // Prevent polling without a partner
    stopPolling();
    pollInterval.current = setInterval(() => {
      fetchMessages(partnerId);
    }, 3000);
  };

  const stopPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
      pollInterval.current = null;
    }
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/messages/search-users?query=${searchQuery}`);
      // Ensure we have an array, even if empty
      setSearchResults(Array.isArray(response.data.users) ? response.data.users : []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }

    
  };

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/messages/conversations');
      // Ensure we have an array, even if empty
      setConversations(Array.isArray(response.data.conversations) ? response.data.conversations : []);
    } catch (err) {
      console.error('Fetch conversations error:', err);
      setError('Failed to load conversations. Please refresh.');
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    if (!partnerId) return;
    
    try {
      const response = await axios.get(`/api/messages/conversation/${partnerId}`);
      // Ensure we have an array, even if empty
      setMessages(Array.isArray(response.data.messages) ? response.data.messages : []);
      
      // Only attempt to mark as read if we have a valid response
      if (response.data.success) {
        await axios.post('/api/messages/mark-read', { sender: partnerId });
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
      setMessages([]); // Reset to empty array on error
    }
  };

  const selectPartner = async (partner) => {
    if (!partner?._id) return;
    
    setSelectedPartner(partner);
    setSearchResults([]);
    setSearchQuery('');
    await fetchMessages(partner._id);
    startPolling(partner._id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner?._id) return;

    const tempMessage = {
      _id: Date.now().toString(), // Ensure string ID
      sender: { _id: 'currentUser' },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...(Array.isArray(prev) ? prev : []), tempMessage]);
    setNewMessage('');

    try {
      await axios.post('/api/messages/send', {
        recipientId: selectedPartner._id,
        content: newMessage
      });
      await fetchMessages(selectedPartner._id);
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(tempMessage.content);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Render loading state
  if (loading && !conversations.length) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Safe render for conversations
  const renderConversations = () => {
    if (!Array.isArray(conversations)) return null;
    
    return conversations.map(conv => (
      <div
        key={conv._id}
        onClick={() => selectPartner(conv)}
        className={`flex items-center p-2 rounded-lg cursor-pointer ${
          selectedPartner?._id === conv._id ? 'bg-zinc-800' : 'hover:bg-zinc-900'
        }`}
      >
        {conv.avatar ? (
          <img src={conv.avatar} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <UserCircle className="w-10 h-10 text-zinc-400" />
        )}
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-center">
            <p className="text-white">{conv.name}</p>
            {conv.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                {conv.unreadCount}
              </span>
            )}
          </div>
          <p className="text-zinc-400 text-sm truncate">{conv.lastMessage}</p>
        </div>
      </div>
    ));
  };

  // Safe render for messages
  const renderMessages = () => {
    if (!Array.isArray(messages)) return null;
    
    return messages.map((message) => (
      <div
        key={message._id}
        className={`flex mb-4 ${
          message.sender._id === 'currentUser' ? 'justify-end' : 'justify-start'
        }`}
      >
        <div
          className={`max-w-[70%] p-3 rounded-lg ${
            message.sender._id === 'currentUser'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-800 text-white'
          }`}
        >
          <p>{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {new Date(message.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - Conversations & Search */}
      <div className="w-1/3 border-r bg-zinc-900 p-4">
        <div className="flex items-center mb-4 bg-zinc-800 rounded-lg">
          <Search className="ml-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 bg-transparent outline-none"
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
                className="flex items-center p-2 hover:bg-zinc-800 cursor-pointer"
                onClick={() => selectPartner(user)}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p>{user.name}</p>
                  <p className="text-zinc-500 text-sm">@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Conversations */}
        <div>
          <h3 className="text-zinc-500 mb-2">Conversations</h3>
          {conversations.map(conv => (
            <div
              key={conv._id}
              className="flex items-center p-2 hover:bg-zinc-800 cursor-pointer"
              onClick={() => selectPartner(conv)}
            >
              <img
                src={conv.avatar}
                alt={conv.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <p>{conv.name}</p>
                <p className="text-zinc-500 text-sm truncate">{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {conv.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedPartner ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b bg-zinc-900">
              <img
                src={selectedPartner.avatar}
                alt={selectedPartner.name}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p>{selectedPartner.name}</p>
                <p className="text-zinc-500 text-sm">@{selectedPartner.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender._id === selectedPartner._id
                      ? 'justify-start'
                      : 'justify-end'
                    }`}
                >
                  <div className={`
                                        max-w-md p-3 rounded-lg 
                                        ${msg.sender._id === selectedPartner._id
                      ? 'bg-zinc-800 text-white'
                      : 'bg-blue-500 text-white'
                    }
                                    `}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex items-center p-4 bg-zinc-900">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 bg-zinc-800 rounded-lg mr-2 text-white"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white p-2 rounded-full"
              >
                <SendHorizontal className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-zinc-500">
            <UserCircle className="w-16 h-16 mr-2" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;