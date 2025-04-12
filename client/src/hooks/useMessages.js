import { useState, useEffect, useRef } from 'react';

export const useMessagesLogic = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState(dummyConversations);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preferredEditors, setPreferredEditors] = useState([]);
  const [loadingEditors, setLoadingEditors] = useState(false);
  const messagesEndRef = useRef(null);
  const pollInterval = useRef(null);
  const currentUserId = "user123";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchPreferredEditors = async () => {
    setLoadingEditors(true);
    try {
      const response = await fetch('http://localhost:3000/api/user/chat-users', {
        method: 'GET',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch preferred editors');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data.users)) {
        setPreferredEditors([...data.users]);
      } else if (Array.isArray(data)) {
        setPreferredEditors(data);
      } else {
        console.error('Unexpected response format:', data);
        setPreferredEditors([]);
      }
    } catch (err) {
      console.error('Error fetching preferred editors:', err);
      setError('Failed to load preferred editors. Please refresh.');
      setPreferredEditors(dummyUsers.slice(0, 3));
    } finally {
      setLoadingEditors(false);
    }
  };

  const simulateApiCall = (data, delay = 500) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(data);
      }, delay);
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const filteredUsers = dummyUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      const results = await simulateApiCall(filteredUsers);
      setSearchResults(results);
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
      const response = await fetch('http://localhost:3000/api/messages/conversations', {
        method: 'GET',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Full API response:", data); // Debug log
      
      // Extract conversations from the nested structure
      const conversationsArray = data.conversations || [];
      console.log("Conversations array:", conversationsArray); // Debug log
      
      // Transform conversations to match expected frontend structure
      const formattedConversations = conversationsArray.map(conv => ({
        _id: conv._id,
        name: conv.name || 'Unknown',
        username: conv.username || 'unknown',
        avatar: conv.avatar || '/api/placeholder/40/40',
        lastMessage: conv.lastMessage || 'No messages yet',
        unreadCount: conv.unreadCount || 0,
        timestamp: conv.timestamp
      }));
      
      setConversations(formattedConversations);
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
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/messages/conversation/${partnerId}`, {
        method: 'GET',
        credentials: "include",
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data?.success || !Array.isArray(data.messages)) {
        throw new Error('Invalid response format');
      }
  
      const formattedMessages = data.messages.map(msg => ({
        _id: msg._id,
        sender: {
          _id: msg.senderId,
          name: msg.senderName,
          avatar: msg.senderAvatar,
          username: msg.senderUsername
        },
        recipient: {
          _id: msg.recipientId,
          name: msg.recipientName,
          username: msg.recipientUsername
        },
        content: msg.content,
        timestamp: msg.timestamp
      }));
  
      setMessages(formattedMessages);
      
      // Update conversation in list
      if (formattedMessages.length > 0) {
        setConversations(prev => prev.map(conv => 
          conv._id === partnerId
            ? { 
                ...conv, 
                lastMessage: formattedMessages[formattedMessages.length - 1].content,
                unreadCount: 0,
                timestamp: formattedMessages[formattedMessages.length - 1].timestamp
              }
            : conv
        ));
      }
    } catch (err) {
      console.error('Message fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectPartner = async (partner) => {
    if (!partner?._id) return;
    
    setSelectedPartner(partner);
    setSearchResults([]);
    setSearchQuery('');
    await fetchMessages(partner._id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner?._id) return;
  
    // Get current user data - adjust this based on how you store user data
    const currentUser = {
      _id: currentUserId, // Assuming you have this
      name: 'You', // Or get from user data
      avatar: '/default-avatar.png', // Default or from user data
      username: 'currentUser' // Or get from user data
    };
  
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: { 
        _id: currentUser._id, 
        name: currentUser.name,
        avatar: currentUser.avatar,
        username: currentUser.username
      },
      recipient: {
        _id: selectedPartner._id,
        name: selectedPartner.name,
        username: selectedPartner.username
      },
      content: newMessage,
      timestamp: new Date().toISOString(),
      pending: true
    };
  
    // Rest of your function remains the same...
    // Optimistic update
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');
  
    try {
      const response = await fetch(`http://localhost:3000/api/messages/send`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedPartner._id,
          content: newMessage
        })
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      
      if (!data?.success) throw new Error('Message send failed');
  
      // Replace temporary message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId ? {
            _id: data.message._id,
            sender: {
              _id: data.message.senderId,
              name: data.message.senderName,
              avatar: data.message.senderAvatar,
              username: data.message.senderUsername
            },
            recipient: {
              _id: data.message.recipientId,
              name: data.message.recipientName,
              username: data.message.recipientUsername
            },
            content: data.message.content,
            timestamp: data.message.timestamp,
            pending: false
          } : msg
        )
      );
      
      // Update conversation list
      setConversations(prev => 
        prev.map(conv => 
          conv._id === selectedPartner._id 
            ? { 
                ...conv, 
                lastMessage: newMessage,
                timestamp: new Date().toISOString(),
                unreadCount: 0
              } 
            : conv
        )
      );
    } catch (err) {
      console.error('Send message error:', err);
      // Remove the optimistic update if failed
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setError('Failed to send message. Please try again.');
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchPreferredEditors(); 
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    conversations,
    selectedPartner,
    messages,
    newMessage,
    setNewMessage,
    loading,
    error,
    preferredEditors,
    loadingEditors,
    messagesEndRef,
    currentUserId,
    handleSearch,
    selectPartner,
    sendMessage
  };
};

// Move dummy data outside the component
const dummyUsers = [
  {
    _id: "user1",
    name: "John Doe",
    username: "johndoe",
    avatar: "/api/placeholder/40/40"
  },
  {
    _id: "user2",
    name: "Jane Smith",
    username: "janesmith",
    avatar: "/api/placeholder/40/40"
  },
  {
    _id: "user3",
    name: "Alex Johnson",
    username: "alexj",
    avatar: "/api/placeholder/40/40"
  },
  {
    _id: "user4",
    name: "Sarah Williams",
    username: "sarahw",
    avatar: "/api/placeholder/40/40"
  },
  {
    _id: "user5",
    name: "Mike Thompson",
    username: "miket",
    avatar: "/api/placeholder/40/40"
  }
];

let dummyConversations = [
  {
    _id: "user1",
    name: "John Doe",
    username: "johndoe",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Hey, how's it going?",
    unreadCount: 2
  },
  {
    _id: "user2",
    name: "Jane Smith",
    username: "janesmith",
    avatar: "/api/placeholder/40/40",
    lastMessage: "Can we meet tomorrow?",
    unreadCount: 0
  },
  {
    _id: "user3",
    name: "Alex Johnson",
    username: "alexj",
    avatar: "/api/placeholder/40/40",
    lastMessage: "The project looks great!",
    unreadCount: 1
  }
];

let dummyMessages = [
  {
    _id: "msg1",
    conversationId: "conv_user123_user1",
    sender: { _id: "user1", name: "John Doe" },
    recipient: { _id: "user123", name: "You" },
    content: "Hey, how's it going?",
    createdAt: "2025-04-08T14:30:00.000Z"
  },
  {
    _id: "msg2",
    conversationId: "conv_user123_user1",
    sender: { _id: "user123", name: "You" },
    recipient: { _id: "user1", name: "John Doe" },
    content: "Not bad! Working on that new React project.",
    createdAt: "2025-04-08T14:32:00.000Z"
  },
  {
    _id: "msg3",
    conversationId: "conv_user123_user1",
    sender: { _id: "user1", name: "John Doe" },
    recipient: { _id: "user123", name: "You" },
    content: "Cool! How's the progress?",
    createdAt: "2025-04-08T14:35:00.000Z"
  },
  {
    _id: "msg4",
    conversationId: "conv_user123_user1",
    sender: { _id: "user1", name: "John Doe" },
    recipient: { _id: "user123", name: "You" },
    content: "Would love to see it when you're done!",
    createdAt: "2025-04-08T14:36:00.000Z"
  },
  {
    _id: "msg5",
    conversationId: "conv_user123_user2",
    sender: { _id: "user2", name: "Jane Smith" },
    recipient: { _id: "user123", name: "You" },
    content: "Hi there! Are you free tomorrow?",
    createdAt: "2025-04-08T10:15:00.000Z"
  },
  {
    _id: "msg6",
    conversationId: "conv_user123_user2",
    sender: { _id: "user123", name: "You" },
    recipient: { _id: "user2", name: "Jane Smith" },
    content: "Hey Jane! Yes, I'm free after 2pm.",
    createdAt: "2025-04-08T10:20:00.000Z"
  },
  {
    _id: "msg7",
    conversationId: "conv_user123_user2",
    sender: { _id: "user2", name: "Jane Smith" },
    recipient: { _id: "user123", name: "You" },
    content: "Great! Can we meet at the coffee shop at 3pm?",
    createdAt: "2025-04-08T10:25:00.000Z"
  },
  {
    _id: "msg8",
    conversationId: "conv_user123_user3",
    sender: { _id: "user3", name: "Alex Johnson" },
    recipient: { _id: "user123", name: "You" },
    content: "I just reviewed your project. It looks amazing!",
    createdAt: "2025-04-07T16:45:00.000Z"
  },
  {
    _id: "msg9",
    conversationId: "conv_user123_user3",
    sender: { _id: "user123", name: "You" },
    recipient: { _id: "user3", name: "Alex Johnson" },
    content: "Thanks Alex! I appreciate the feedback.",
    createdAt: "2025-04-07T17:00:00.000Z"
  },
  {
    _id: "msg10",
    conversationId: "conv_user123_user3",
    sender: { _id: "user3", name: "Alex Johnson" },
    recipient: { _id: "user123", name: "You" },
    content: "No problem. The design is really clean.",
    createdAt: "2025-04-07T17:05:00.000Z"
  }
];