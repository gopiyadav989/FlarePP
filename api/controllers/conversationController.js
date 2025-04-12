import mongoose from "mongoose";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import Creator from "../models/creatorModel.js";
import Editor from "../models/editorModel.js";

// Helper function to get user model and document
const getUserModel = (role) => role.toLowerCase() === 'creator' ? Creator : Editor;

// Get all conversations for the current user
export const getUserConversations = async (req, res) => {
  try {
    const user = req.user;
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      "participants.user": user.id,
      "participants.model": user.role
    })
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    // Prepare response data with partner information
    const conversationsData = await Promise.all(conversations.map(async (conversation) => {
      // Find the partner participant (not the current user)
      const partner = conversation.participants.find(
        p => !p.user.equals(user.id)
      );
      
      // Get details of the partner
      const PartnerModel = getUserModel(partner.model);
      const partnerDetails = await PartnerModel.findById(partner.user)
        .select('name username avatar');
      
      // Get unread message count
      const unreadCount = await Message.countDocuments({
        sender: partner.user,
        receiver: user.id,
        read: false
      });
      
      return {
        conversationId: conversation._id,
        partner: {
          id: partnerDetails._id,
          name: partnerDetails.name,
          username: partnerDetails.username,
          avatar: partnerDetails.avatar,
          role: partner.model
        },
        lastMessage: conversation.lastMessage,
        unreadCount: unreadCount,
        updatedAt: conversation.updatedAt
      };
    }));
    
    res.status(200).json({ conversations: conversationsData });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get a specific conversation or create if doesn't exist
export const getOrCreateConversation = async (req, res) => {
  try {
    const user = req.user;
    const { partnerId, partnerRole } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ error: 'Invalid partner ID' });
    }
    
    // Validate partner exists
    const PartnerModel = getUserModel(partnerRole);
    const partnerExists = await PartnerModel.exists({ _id: partnerId });
    
    if (!partnerExists) {
      return res.status(404).json({ error: 'Partner not found' });
    }
    
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: {
        $all: [
          { $elemMatch: { user: user.id, model: user.role } },
          { $elemMatch: { user: partnerId, model: partnerRole } }
        ]
      }
    });
    
    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = new Conversation({
        participants: [
          { user: user.id, model: user.role },
          { user: partnerId, model: partnerRole }
        ]
      });
      
      await conversation.save();
    }
    
    // Get messages for this conversation
    const messages = await Message.find({
      $or: [
        { sender: user.id, receiver: partnerId },
        { sender: partnerId, receiver: user.id }
      ]
    })
    .sort({ timestamp: 1 })
    .populate({
      path: 'sender',
      select: 'name username avatar',
      model: (doc) => doc.senderModel === 'creator' ? Creator : Editor
    })
    .populate({
      path: 'receiver',
      select: 'name username avatar',
      model: (doc) => doc.receiverModel === 'creator' ? Creator : Editor
    });
    
    // Get partner details
    const partner = await PartnerModel.findById(partnerId)
      .select('name username avatar');
    
    res.status(200).json({
      conversation: {
        _id: conversation._id,
        partner: {
          id: partner._id,
          name: partner.name,
          username: partner.username,
          avatar: partner.avatar,
          role: partnerRole
        },
        messages: messages
      }
    });
  } catch (error) {
    console.error('Error with conversation:', error);
    res.status(500).json({ error: 'Failed to process conversation' });
  }
};

// Send message within a conversation
export const sendMessageInConversation = async (req, res) => {
  try {
    const user = req.user;
    const { conversationId, content } = req.body;
    
    if (!content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    
    // Find conversation and verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    const userParticipant = conversation.participants.find(
      p => p.user.equals(user.id) && p.model === user.role
    );
    
    if (!userParticipant) {
      return res.status(403).json({ error: 'Not authorized to send messages in this conversation' });
    }
    
    // Find the recipient
    const recipient = conversation.participants.find(
      p => !p.user.equals(user.id)
    );
    
    // Create and save new message
    const newMessage = new Message({
      sender: user.id,
      senderModel: user.role,
      receiver: recipient.user,
      receiverModel: recipient.model,
      message: content,
      read: false
    });
    
    await newMessage.save();
    
    // Update conversation's lastMessage and updatedAt
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    // Populate sender and receiver info for response
    await newMessage.populate({
      path: 'sender',
      select: 'name username avatar',
      model: user.role === 'creator' ? Creator : Editor
    });
    
    await newMessage.populate({
      path: 'receiver',
      select: 'name username avatar',
      model: recipient.model === 'creator' ? Creator : Editor
    });
    
    res.status(201).json({ message: newMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Mark all messages in a conversation as read
export const markConversationAsRead = async (req, res) => {
  try {
    const user = req.user;
    const { conversationId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    
    // Find conversation and verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    const userParticipant = conversation.participants.find(
      p => p.user.equals(user.id) && p.model === user.role
    );
    
    if (!userParticipant) {
      return res.status(403).json({ error: 'Not authorized for this conversation' });
    }
    
    // Find the partner
    const partner = conversation.participants.find(
      p => !p.user.equals(user.id)
    );
    
    // Mark all messages from partner to user as read
    await Message.updateMany(
      {
        sender: partner.user,
        receiver: user.id,
        read: false
      },
      { $set: { read: true } }
    );
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
};

// Delete conversation (soft delete or archive)
export const archiveConversation = async (req, res) => {
  try {
    const user = req.user;
    const { conversationId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: 'Invalid conversation ID' });
    }
    
    // Find conversation and verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Check if user is part of this conversation
    const userParticipant = conversation.participants.find(
      p => p.user.equals(user.id) && p.model === user.role
    );
    
    if (!userParticipant) {
      return res.status(403).json({ error: 'Not authorized for this conversation' });
    }
    
    // Instead of deleting, we could add an "archived" field to the conversation schema
    // For now, we'll mark it as archived for the specific user
    // First, extend your schema to include this field:
    // archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    
    // Then use this to mark as archived:
    // await Conversation.findByIdAndUpdate(
    //   conversationId,
    //   { $addToSet: { archivedBy: user.id } }
    // );
    
    // For this implementation, we'll just remove the conversation
    await Conversation.findByIdAndDelete(conversationId);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    res.status(500).json({ error: 'Failed to archive conversation' });
  }
};
