import React, { useState, useEffect } from 'react';
import { Search, UserCircle, SendHorizontal } from 'lucide-react';

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Hardcoded Users
  const hardcodedUsers = [
    { _id: '1', name: 'Creator One', username: 'creator1', avatar: '/path/to/avatar1.jpg' },
    { _id: '2', name: 'Editor One', username: 'editor1', avatar: '/path/to/avatar2.jpg' },
    { _id: '3', name: 'Creator Two', username: 'creator2', avatar: '/path/to/avatar3.jpg' }
  ];

  // Hardcoded Conversations
  const hardcodedConversations = [
    {
      _id: '1',
      name: 'Creator One',
      avatar: '/path/to/avatar1.jpg',
      lastMessage: 'Hey, how are you?',
      unreadCount: 2
    },
    {
      _id: '2',
      name: 'Editor One',
      avatar: '/path/to/avatar2.jpg',
      lastMessage: 'Please review the video.',
      unreadCount: 0
    }
  ];

  // Hardcoded Messages
  const hardcodedMessages = [
    { sender: { _id: '1' }, content: 'Hello! How is the video editing going?' },
    { sender: { _id: '2' }, content: 'It’s going well, thanks for asking.' }
  ];

  // Search Users
  const handleSearch = () => {
    setSearchResults(
      hardcodedUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  // Fetch Conversations
  const fetchConversations = () => {
    setConversations(hardcodedConversations);
  };

  // Select Conversation Partner
  const selectPartner = (partner) => {
    setSelectedPartner(partner);
    setMessages(hardcodedMessages);
  };

  // Send Message
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedPartner) return;

    const tempMessage = {
      sender: { _id: 'me' }, // Assume 'me' for current user
      content: newMessage,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
  };

  useEffect(() => {
    fetchConversations();
  }, []);

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
