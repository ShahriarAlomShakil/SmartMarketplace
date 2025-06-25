import { useState, useEffect, useCallback } from 'react';
import { NegotiationMessage, MessageType, MessageSender } from '../../../shared/types/Negotiation';
import { negotiationAPI } from '../utils/api';

/**
 * useChat Hook - Chat state management for negotiations
 * 
 * Features:
 * - Message state management
 * - Real-time message updates
 * - Typing indicators
 * - Connection status
 * - Message sending
 * - Error handling
 */

interface UseChatProps {
  negotiationId: string;
  currentUserRole: 'buyer' | 'seller';
  onMessageReceived?: (message: NegotiationMessage) => void;
  onTypingChanged?: (isTyping: boolean, user: string) => void;
}

interface ChatState {
  messages: NegotiationMessage[];
  isLoading: boolean;
  isTyping: boolean;
  typingUser?: string;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  error: string | null;
}

export const useChat = ({
  negotiationId,
  currentUserRole,
  onMessageReceived,
  onTypingChanged
}: UseChatProps) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isTyping: false,
    connectionStatus: 'connecting',
    error: null
  });

  // Load initial messages
  const loadMessages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await negotiationAPI.getById(negotiationId);
      const negotiation = response.data.negotiation;
      
      setState(prev => ({
        ...prev,
        messages: negotiation.messages || [],
        isLoading: false,
        connectionStatus: 'connected'
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        connectionStatus: 'disconnected',
        error: error instanceof Error ? error.message : 'Failed to load messages'
      }));
    }
  }, [negotiationId]);

  // Send message
  const sendMessage = useCallback(async (content: string, type: MessageType = MessageType.MESSAGE) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      const response = await negotiationAPI.sendMessage(negotiationId, content);
      
      // Add optimistic update
      const newMessage: NegotiationMessage = {
        _id: `temp-${Date.now()}`,
        type,
        sender: currentUserRole === 'buyer' ? MessageSender.USER : MessageSender.OWNER,
        content,
        timestamp: new Date(),
        isRead: false,
        reactions: []
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));

      // Reload to get AI response and actual message IDs
      setTimeout(loadMessages, 1000);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send message'
      }));
    }
  }, [negotiationId, currentUserRole, loadMessages]);

  // Send offer
  const sendOffer = useCallback(async (amount: number, message?: string) => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      // Use message API with offer amount for now
      const offerMessage = message || `I'd like to offer $${amount}`;
      const response = await negotiationAPI.sendMessage(negotiationId, offerMessage, amount);
      
      // Add optimistic update
      const newMessage: NegotiationMessage = {
        _id: `temp-offer-${Date.now()}`,
        type: MessageType.OFFER,
        sender: currentUserRole === 'buyer' ? MessageSender.USER : MessageSender.OWNER,
        content: offerMessage,
        offer: {
          amount,
          currency: 'USD'
        },
        timestamp: new Date(),
        isRead: false,
        reactions: []
      };
      
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, newMessage]
      }));

      // Reload to get AI response and actual message IDs
      setTimeout(loadMessages, 1000);
      
    } catch (error) {
      console.error('Failed to send offer:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send offer'
      }));
    }
  }, [negotiationId, currentUserRole, loadMessages]);

  // Set typing indicator
  const setTyping = useCallback((isTyping: boolean) => {
    setState(prev => ({ ...prev, isTyping }));
    onTypingChanged?.(isTyping, currentUserRole);
  }, [currentUserRole, onTypingChanged]);

  // Mark messages as read
  const markAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(msg => ({
        ...msg,
        isRead: msg.sender !== (currentUserRole === 'buyer' ? MessageSender.USER : MessageSender.OWNER) ? true : msg.isRead
      }))
    }));
  }, [currentUserRole]);

  // Connection retry
  const retry = useCallback(() => {
    setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
    loadMessages();
  }, [loadMessages]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Handle received messages
  useEffect(() => {
    if (onMessageReceived) {
      state.messages.forEach(message => {
        if (message.sender !== MessageSender.USER && message.sender !== MessageSender.OWNER) {
          onMessageReceived(message);
        }
      });
    }
  }, [state.messages, currentUserRole, onMessageReceived]);

  return {
    ...state,
    sendMessage,
    sendOffer,
    setTyping,
    markAsRead,
    retry,
    refreshMessages: loadMessages
  };
};

export default useChat;
