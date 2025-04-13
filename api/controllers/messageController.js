import mongoose from 'mongoose';
import Message from '../models/messageModel.js';
import Creator from '../models/creatorModel.js';
import Editor from '../models/editorModel.js';
import Conversation from '../models/conversationModel.js';

const findOrCreateConversation = async (user1Id, user1Model, user2Id, user2Model) => {
  console.log(`Finding conversation between ${user1Id}(${user1Model}) and ${user2Id}(${user2Model})`);
  
  // First, try to find an existing conversation
  const existingConversation = await Conversation.findOne({
    $and: [
      { 'participants.user': user1Id },
      { 'participants.user': user2Id }
    ]
  });
  
  if (existingConversation) {
    console.log(`Found existing conversation: ${existingConversation._id}`);
    return existingConversation;
  }
  
  // If no conversation exists, create a new one
  console.log('Creating new conversation');
  const newConversation = new Conversation({
    participants: [
      { user: user1Id, model: user1Model },
      { user: user2Id, model: user2Model }
    ],
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  await newConversation.save();
  console.log(`Created new conversation: ${newConversation._id}`);
  return newConversation;
};

export const searchUsers = async (req, res) => {
  try {
    console.log(`Searching for users with query: ${req.query.q}`);
    const query = req.query.q || '';
    const creators = await Creator.find({ 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ] 
    }).limit(5);
    
    const editors = await Editor.find({ 
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ] 
    }).limit(5);
    
    const users = [
      ...creators.map(c => ({ 
        _id: c._id, 
        name: c.name, 
        username: c.username, 
        avatar: c.avatar,
        role: 'Creator'
      })),
      ...editors.map(e => ({ 
        _id: e._id, 
        name: e.name, 
        username: e.username, 
        avatar: e.avatar,
        role: 'Editor'
      }))
    ];
    
    console.log(`Found ${users.length} users`);
    res.json({ users });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};

export const getConversations = async (req, res) => {
  try {
    const user = req.user;
    console.log(`Getting conversations for user: ${user.id}, role: ${user.role}`);
    
    const conversations = await Conversation.find({
      'participants.user': user.id
    })
    .sort({ updatedAt: -1 })
    .populate('lastMessage');
    
    console.log(`Found ${conversations.length} conversations`);
    
    const formattedConversations = await Promise.all(conversations.map(async (conv) => {
      try {
        const otherParticipant = conv.participants.find(
          p => p.user.toString() !== user.id
        );
        
        if (!otherParticipant) {
          console.warn(`No other participant found in conversation ${conv._id}`);
          return null;
        }
        
        let partner;
        if (otherParticipant.model === 'Creator') {
          partner = await Creator.findById(otherParticipant.user);
        } else {
          partner = await Editor.findById(otherParticipant.user);
        }
        
        if (!partner) {
          console.warn(`Partner not found: ${otherParticipant.user}`);
          return null;
        }
        
        const unreadCount = await Message.countDocuments({
          _id: { $in: conv.messages },
          sender: otherParticipant.user,
          receiver: user.id,
          read: false
        });
        
        return {
          _id: partner._id,
          name: partner.name || partner.fullName || 'Unknown',
          username: partner.username || 'unknown',
          avatar: partner.avatar,
          lastMessage: conv.lastMessage ? conv.lastMessage.content : 'No messages yet',
          timestamp: conv.updatedAt,
          unreadCount
        };
      } catch (err) {
        console.error(`Error processing conversation ${conv._id}:`, err);
        return null;
      }
    }));
    
    const validConversations = formattedConversations.filter(Boolean);
    console.log(`Returning ${validConversations.length} valid conversations`);
    
    res.json({ conversations: validConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const user = req.user;
    
    console.log(`Getting messages between ${user.id} and ${partnerId}`);

    const messages = await Message.find({
      $or: [
        { sender: user.id, receiver: partnerId },
        { sender: partnerId, receiver: user.id }
      ]
    }).sort({ createdAt: 1 }); 
    
    console.log(`Found ${messages.length} messages`);
    
    if (messages.length === 0) {
      return res.json({ 
        success: true,
        messages: [],
        currentUserId: user.id
      });
    }

    // Format messages for frontend - using a simpler format
    const formattedMessages = messages.map(msg => {
      const isCurrentUser = msg.sender.toString() === user.id;
      console.log(`Message ${msg._id}: sender=${msg.sender}, receiver=${msg.receiver}, isCurrentUser=${isCurrentUser}`);
      
      return {
        _id: msg._id.toString(),
        content: msg.content,
        timestamp: msg.createdAt,
        isCurrentUser: isCurrentUser,
        sender: {
          _id: msg.sender.toString()
        },
        receiver: {
          _id: msg.receiver.toString()
        }
      };
    });
    
    console.log(`Returning ${formattedMessages.length} formatted messages`);

    await Message.updateMany(
      {
        sender: partnerId,
        receiver: user.id,
        read: false
      },
      { read: true }
    );

    res.json({ 
      success: true,
      messages: formattedMessages,
      currentUserId: user.id
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch messages' 
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    const { recipientId, content } = req.body;
    
    console.log(`Sending message from ${user.id} to ${recipientId}: "${content}"`);
    
    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message content required'
      });
    }
    
    // Get recipient details
    let recipient = await Creator.findById(recipientId);
    let recipientModel = 'Creator';
    
    if (!recipient) {
      recipient = await Editor.findById(recipientId);
      recipientModel = 'Editor';
    }
    
    if (!recipient) {
      console.error(`Recipient not found: ${recipientId}`);
      return res.status(404).json({
        success: false,
        error: 'Recipient not found'
      });
    }
    
    // Create and save the message
    const newMessage = new Message({
      sender: user.id,
      senderModel: user.role === 'creator' ? 'Creator' : 'Editor',
      receiver: recipientId,
      receiverModel: recipientModel,
      content,
      read: false,
      createdAt: new Date()
    });
    
    const savedMessage = await newMessage.save();
    console.log(`Message saved: ${savedMessage._id}`);
    
    res.status(201).json({
      success: true,
      message: {
        _id: savedMessage._id.toString(),
        content: savedMessage.content,
        timestamp: savedMessage.createdAt,
        isCurrentUser: true,
        sender: user.id
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message'
    });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const user = req.user;
    const { partnerId } = req.body;
    
    console.log(`Marking messages from ${partnerId} to ${user.id} as read`);
    
    const updateResult = await Message.updateMany(
      {
        sender: partnerId,
        receiver: user.id,
        read: false
      },
      { read: true }
    );
    
    console.log(`Marked ${updateResult.nModified || 0} messages as read`);
    
    res.json({
      success: true,
      markedCount: updateResult.nModified || 0
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark messages as read'
    });
  }
};