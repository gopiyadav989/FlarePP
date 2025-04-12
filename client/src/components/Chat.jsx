// Chat.js - Logic Component
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// This component handles all the chat logic but doesn't render UI
const useChat = (currentUserId) => {
  // State for conversations
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [preferredEditors, setPreferredEditors] = useState([]);
  
  // State for messages
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [loadingEditors, setLoadingEditors] = useState(false);
  const [error, setError] = useState(null);
  
  // WebSocket connection
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch conversations from the API
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/api/messages/conversations', {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setConversations(response.data.conversations);
      } else {
        throw new Error('Failed to fetch conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch preferred editors
  const fetchPreferredEditors = async () => {
    setLoadingEditors(true);
    try {
      const response = await axios.get('http://localhost:3000/api/user/chat-users', {
        withCredentials: true
      });
      
      if (response.data && Array.isArray(response.data.users)) {
        setPreferredEditors(response.data.users);
      } else if (Array.isArray(response.data)) {
        setPreferredEditors(response.data);
      } else {
        console.error('Unexpected response format:', response.data);
        setPreferredEditors([]);
      }
    } catch (err) {
      console.error('Error fetching preferred editors:', err);
      setError('Failed to load preferred editors.');
    } finally {
      setLoadingEditors(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:3000/api/user/search?q=${searchQuery}`, {
        withCredentials: true
      });
      
      if (response.data && Array.isArray(response.data.users)) {
        setSearchResults(response.data.users);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search users. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (partnerId, partnerModel) => {
    if (!partnerId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/messages/conversation/${partnerId}/${partnerModel}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setMessages(response.data.messages);
      } else {
        throw new Error('Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Select a conversation partner
  const selectPartner = async (partner) => {
    if (!partner?._id) return;
    
    setSelectedPartner(partner);
    setSearchResults([]);
    setSearchQuery('');
    await fetchMessages(partner._id, partner.userModel || (partner.role === 'creator' ? 'Creator' : 'Editor'));
  };

  // Connect WebSocket
  useEffect(() => {
    const connectWebSocket = () => {
      const socket = new WebSocket(`ws://${window.location.hostname}:5000`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        socket.send(JSON.stringify({ type: 'auth', userId: 'currentUser' }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message') {
          const incoming = data.message;

          // Add to messages if from current conversation
          if (selectedPartner && 
             ((incoming.sender === selectedPartner._id && incoming.receiver === 'currentUser') ||
              (incoming.sender === 'currentUser' && incoming.receiver === selectedPartner._id))) {
            setMessages(prev => [...prev, incoming]);
          }
          
          // Update conversations list
          fetchConversations();
        }
      };

      socket.onerror = (err) => console.error('WebSocket error:', err);
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  // Send new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedPartner?._id) return;

    const tempMessage = {
      _id: Date.now().toString(),
      sender: { _id: 'currentUser' },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...(Array.isArray(prev) ? prev : []), tempMessage]);
    setNewMessage('');

    try {
      // Send via WebSocket if connected
      if (isConnected && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          senderId: 'currentUser',
          receiverId: selectedPartner._id,
          message: newMessage.trim()
        }));
      } else {
        // Fallback to HTTP
        await axios.post('http://localhost:3000/api/messages/send', {
          recipientId: selectedPartner._id,
          content: newMessage.trim()
        });
      }
      await fetchMessages(selectedPartner._id);
    } catch (err) {
      console.error('Send message error:', err);
      setError('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      setNewMessage(tempMessage.content);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchConversations();
    fetchPreferredEditors();
  }, []);

  return {
    // State
    searchQuery,
    searchResults,
    conversations,
    selectedPartner,
    preferredEditors,
    messages,
    newMessage,
    loading,
    loadingEditors,
    error,
    isConnected,
    
    // Functions
    setSearchQuery,
    handleSearch,
    selectPartner,
    setNewMessage,
    sendMessage,
    fetchConversations,
    fetchPreferredEditors
  };
};

export default useChat;