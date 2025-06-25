const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Negotiation = require('../models/Negotiation');

/**
 * Enhanced Socket.IO handler for real-time chat features
 * 
 * Features:
 * - User authentication via JWT tokens
 * - Negotiation room management
 * - Real-time message broadcasting
 * - Typing indicators
 * - User presence tracking
 * - Connection management
 * - Message delivery confirmation
 */

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // Map of userId -> Set of socketIds
    this.userSockets = new Map(); // Map of socketId -> user info
    this.typingUsers = new Map(); // Map of negotiationId -> Set of typing users
  }

  // Initialize socket event handlers
  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);
      
      // Handle authentication
      socket.on('authenticate', async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('-password');
          
          if (!user) {
            socket.emit('auth-error', { message: 'User not found' });
            return;
          }

          // Store user info
          socket.userId = user._id.toString();
          socket.userInfo = {
            _id: user._id,
            username: user.username,
            avatar: user.profile?.avatar
          };

          // Track connected users
          if (!this.connectedUsers.has(socket.userId)) {
            this.connectedUsers.set(socket.userId, new Set());
          }
          this.connectedUsers.get(socket.userId).add(socket.id);
          this.userSockets.set(socket.id, socket.userInfo);

          // Emit authentication success
          socket.emit('authenticated', { user: socket.userInfo });
          
          console.log(`👤 User authenticated: ${user.username} (${socket.id})`);
          
        } catch (error) {
          console.error('Authentication error:', error);
          socket.emit('auth-error', { message: 'Invalid token' });
        }
      });

      // Join negotiation room
      socket.on('join-negotiation', async (negotiationId) => {
        try {
          if (!socket.userId) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
          }

          // Verify user is participant in negotiation
          const negotiation = await Negotiation.findById(negotiationId)
            .populate('buyer', 'username avatar')
            .populate('seller', 'username avatar');

          if (!negotiation) {
            socket.emit('error', { message: 'Negotiation not found' });
            return;
          }

          const isParticipant = (
            negotiation.buyer._id.toString() === socket.userId ||
            negotiation.seller._id.toString() === socket.userId
          );

          if (!isParticipant) {
            socket.emit('error', { message: 'Not authorized to join this negotiation' });
            return;
          }

          // Join the room
          socket.join(`negotiation-${negotiationId}`);
          socket.currentNegotiation = negotiationId;

          // Notify other participants
          socket.to(`negotiation-${negotiationId}`).emit('user-joined', {
            user: socket.userInfo,
            timestamp: new Date()
          });

          // Send current room status
          const roomSockets = await this.io.in(`negotiation-${negotiationId}`).fetchSockets();
          const activeUsers = roomSockets
            .filter(s => s.userInfo)
            .map(s => s.userInfo);

          socket.emit('room-status', {
            negotiationId,
            activeUsers,
            onlineCount: activeUsers.length
          });

          console.log(`🏠 User ${socket.userInfo.username} joined negotiation ${negotiationId}`);
          
        } catch (error) {
          console.error('Join negotiation error:', error);
          socket.emit('error', { message: 'Failed to join negotiation' });
        }
      });

      // Leave negotiation room
      socket.on('leave-negotiation', (negotiationId) => {
        if (socket.currentNegotiation === negotiationId) {
          socket.leave(`negotiation-${negotiationId}`);
          
          // Notify other participants
          socket.to(`negotiation-${negotiationId}`).emit('user-left', {
            user: socket.userInfo,
            timestamp: new Date()
          });

          // Stop typing if user was typing
          this.handleTypingStop(socket, negotiationId);
          
          socket.currentNegotiation = null;
          console.log(`🚪 User ${socket.userInfo?.username} left negotiation ${negotiationId}`);
        }
      });

      // Handle new messages with enhanced delivery confirmation
      socket.on('send-message', async (data) => {
        try {
          if (!socket.userId || !socket.currentNegotiation) {
            socket.emit('error', { message: 'Not authenticated or not in negotiation' });
            return;
          }

          const { content, type = 'message', offer, tempId } = data;
          
          // Validate message content
          if (!content || content.trim().length === 0) {
            socket.emit('message-failed', {
              messageId: tempId || '',
              tempId,
              error: 'Message content cannot be empty',
              retryable: false
            });
            return;
          }

          // Check for rate limiting (optional)
          const now = Date.now();
          if (!socket.lastMessageTime) socket.lastMessageTime = 0;
          if (now - socket.lastMessageTime < 1000) { // 1 second rate limit
            socket.emit('message-failed', {
              messageId: tempId || '',
              tempId,
              error: 'Messages sent too quickly. Please wait a moment.',
              retryable: true
            });
            return;
          }
          socket.lastMessageTime = now;
          
          // Create message ID
          const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Broadcast message to room immediately (optimistic update)
          const messageData = {
            _id: messageId,
            type,
            sender: socket.userId,
            senderInfo: socket.userInfo,
            content,
            offer,
            timestamp: new Date(),
            negotiationId: socket.currentNegotiation,
            status: 'delivered',
            tempId
          };

          // Broadcast to all users in the negotiation
          this.io.to(`negotiation-${socket.currentNegotiation}`).emit('new-message', messageData);
          
          // Send delivery confirmation to sender
          socket.emit('message-delivered', {
            messageId,
            tempId,
            timestamp: new Date()
          });

          // Stop typing indicator since message was sent
          this.handleTypingStop(socket, socket.currentNegotiation);

          console.log(`💬 Message sent in negotiation ${socket.currentNegotiation}: ${content.substring(0, 50)}...`);

        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('message-failed', { 
            messageId: data.tempId || '',
            tempId: data.tempId,
            error: 'Failed to send message',
            retryable: true
          });
        }
      });

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        if (!socket.userId || !socket.currentNegotiation) return;
        this.handleTypingStart(socket, data.negotiationId || socket.currentNegotiation);
      });

      socket.on('typing-stop', (data) => {
        if (!socket.userId || !socket.currentNegotiation) return;
        this.handleTypingStop(socket, data.negotiationId || socket.currentNegotiation);
      });

      // Handle message read receipts
      socket.on('mark-messages-read', async (data) => {
        try {
          if (!socket.userId || !socket.currentNegotiation) return;

          const { messageIds } = data;
          
          // Broadcast read receipt to other participants
          socket.to(`negotiation-${socket.currentNegotiation}`).emit('messages-read', {
            messageIds,
            readBy: socket.userInfo,
            timestamp: new Date()
          });

        } catch (error) {
          console.error('Mark messages read error:', error);
        }
      });

      // Handle ping for connection quality monitoring
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  // Handle typing start
  handleTypingStart(socket, negotiationId) {
    if (!this.typingUsers.has(negotiationId)) {
      this.typingUsers.set(negotiationId, new Set());
    }
    
    const typingSet = this.typingUsers.get(negotiationId);
    typingSet.add(socket.userId);

    // Broadcast typing indicator to other participants
    socket.to(`negotiation-${negotiationId}`).emit('user-typing', {
      user: socket.userInfo,
      isTyping: true,
      timestamp: new Date()
    });
  }

  // Handle typing stop
  handleTypingStop(socket, negotiationId) {
    if (!this.typingUsers.has(negotiationId)) return;
    
    const typingSet = this.typingUsers.get(negotiationId);
    typingSet.delete(socket.userId);

    // Broadcast typing stop to other participants
    socket.to(`negotiation-${negotiationId}`).emit('user-typing', {
      user: socket.userInfo,
      isTyping: false,
      timestamp: new Date()
    });
  }

  // Handle socket disconnect
  handleDisconnect(socket) {
    console.log(`🔌 Socket disconnected: ${socket.id}`);

    if (socket.userId) {
      // Remove from connected users
      const userSockets = this.connectedUsers.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(socket.userId);
        }
      }

      // Notify current negotiation about user leaving
      if (socket.currentNegotiation) {
        socket.to(`negotiation-${socket.currentNegotiation}`).emit('user-left', {
          user: socket.userInfo,
          timestamp: new Date()
        });

        // Stop typing
        this.handleTypingStop(socket, socket.currentNegotiation);
      }
    }

    // Clean up user socket mapping
    this.userSockets.delete(socket.id);
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId) && this.connectedUsers.get(userId).size > 0;
  }

  // Get online users in a negotiation
  async getOnlineUsersInNegotiation(negotiationId) {
    try {
      const roomSockets = await this.io.in(`negotiation-${negotiationId}`).fetchSockets();
      return roomSockets
        .filter(socket => socket.userInfo)
        .map(socket => socket.userInfo);
    } catch (error) {
      console.error('Error getting online users:', error);
      return [];
    }
  }

  // Broadcast message to negotiation room
  broadcastToNegotiation(negotiationId, event, data) {
    this.io.to(`negotiation-${negotiationId}`).emit(event, data);
  }

  // Send message to specific user
  sendToUser(userId, event, data) {
    const userSockets = this.connectedUsers.get(userId);
    if (userSockets) {
      userSockets.forEach(socketId => {
        this.io.to(socketId).emit(event, data);
      });
    }
  }
}

module.exports = SocketHandler;
