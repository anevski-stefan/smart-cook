'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Avatar,
  useTheme,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
  InputAdornment,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import {
  Send as SendIcon,
  PhotoCamera,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  List as ListIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import ReactMarkdown from 'react-markdown';
import { alpha } from '@mui/material/styles';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  image?: string;
  chat_id?: string;
}

interface Chat {
  id: string;
  title: string;
  updated_at: string;
  messages?: Message[];
}

// Define an interface for the message data
interface MessageData {
  chat_id: string;
  sender: 'user' | 'assistant';
  content: string;
  image_url?: string;
}

// Define a type for Supabase errors
interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  [key: string]: string | undefined;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [chatMenuAnchorEl, setChatMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
  const [chatOptionsAnchorEl, setChatOptionsAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChatForOptions, setSelectedChatForOptions] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  // Add a flag to prevent reloading messages during API call
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);
  // Add a ref to track messages during API calls
  const pendingMessagesRef = useRef<Message[]>([]);

  // Add auto-resize functionality for the input
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  // Add a function to save messages to localStorage
  const saveMessagesToLocalStorage = useCallback((chatId: string, msgs: Message[]) => {
    if (!chatId || msgs.length === 0) return;
    
    try {
      const key = `chat_messages_${chatId}`;
      localStorage.setItem(key, JSON.stringify(msgs));
      console.log(`Saved ${msgs.length} messages to localStorage for chat ${chatId}`);
    } catch (error) {
      console.error('Error saving messages to localStorage:', error);
    }
  }, []);
  
  // Add a function to load messages from localStorage
  const loadMessagesFromLocalStorage = useCallback((chatId: string): Message[] => {
    if (!chatId) return [];
    
    try {
      const key = `chat_messages_${chatId}`;
      const storedMessages = localStorage.getItem(key);
      
      if (!storedMessages) return [];
      
      const parsedMessages = JSON.parse(storedMessages) as Message[];
      // Convert string dates back to Date objects
      const fixedMessages = parsedMessages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      
      console.log(`Loaded ${fixedMessages.length} messages from localStorage for chat ${chatId}`);
      return fixedMessages;
    } catch (error) {
      console.error('Error loading messages from localStorage:', error);
      return [];
    }
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (currentChat && messages.length > 0) {
      saveMessagesToLocalStorage(currentChat.id, messages);
    }
  }, [messages, currentChat, saveMessagesToLocalStorage]);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      console.log('Loading messages for chat ID:', chatId);
      
      // First, check if the chat ID is valid
      if (!chatId) {
        console.error('Invalid chat ID provided to loadMessages');
        return;
      }
      
      // Check if the chat exists
      const { data: chatExists, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('id', chatId)
        .single();
        
      if (chatError) {
        // Only log as error if it's not a "not found" error
        if (chatError.code !== 'PGRST116') {
          console.error('Error checking chat:', chatError);
        } else {
          console.warn('Chat not found:', chatId);
        }
        return;
      }
      
      if (!chatExists) {
        console.warn('Chat does not exist:', chatId);
        return;
      }
      
      // Log the query we're about to make
      console.log('Querying chat_messages table with chat_id:', chatId);
      
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      console.log('Loaded messages:', messagesData.length);
      
      // Log the raw message data from the database
      console.log('Raw message data from database:', messagesData);
      
      if (!messagesData || messagesData.length === 0) {
        console.log('No messages found for this chat');
        
        // Check if we already have unsaved messages in the state for this chat
        const unsavedMessages = messages.filter(msg => msg.chat_id === chatId);
        if (unsavedMessages.length > 0) {
          console.log('Found unsaved messages in state, preserving them:', unsavedMessages.length);
          return; // Keep the existing messages
        }
        
        // Try to load messages from localStorage as a fallback
        const localMessages = loadMessagesFromLocalStorage(chatId);
        if (localMessages.length > 0) {
          console.log('Found messages in localStorage, using them:', localMessages.length);
          setMessages(localMessages);
          return;
        }
        
        // Remove the welcome message
        setMessages([]);
        return;
      }
      
      // Map the database messages to the UI format with explicit type checking
      const mappedMessages = messagesData.map(msg => {
        // Ensure sender is either 'user' or 'assistant'
        const sender = msg.sender === 'user' ? 'user' as const : 'assistant' as const;
        
        // Log each message as it's being mapped
        console.log('Mapping message:', {
          id: msg.id,
          content: msg.content,
          sender: msg.sender,
          created_at: msg.created_at
        });
        
        return {
          id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          text: msg.content || '',
          sender: sender,
          timestamp: new Date(msg.created_at),
          image: msg.image_url,
          chat_id: msg.chat_id
        };
      });
      
      console.log('Mapped messages for UI:', mappedMessages);
      
      // Check for any unsaved messages in the current state
      const existingMessages = messages.filter(msg => msg.chat_id === chatId);
      const dbMessageIds = new Set(mappedMessages.map(msg => msg.id));
      const unsavedMessages = existingMessages.filter(msg => !dbMessageIds.has(msg.id));
      
      // Also check localStorage for any messages that might not be in the database yet
      const localMessages = loadMessagesFromLocalStorage(chatId);
      const additionalLocalMessages = localMessages.filter(msg => 
        !dbMessageIds.has(msg.id) && !existingMessages.some(m => m.id === msg.id)
      );
      
      if (unsavedMessages.length > 0 || additionalLocalMessages.length > 0) {
        console.log('Found messages that need to be preserved:', 
          unsavedMessages.length + additionalLocalMessages.length);
        
        // Combine all messages
        const combinedMessages = [
          ...mappedMessages, 
          ...unsavedMessages,
          ...additionalLocalMessages
        ];
        
        // Remove duplicates by ID
        const uniqueMessages = Array.from(
          new Map(combinedMessages.map(msg => [msg.id, msg])).values()
        );
        
        // Sort by timestamp to maintain chronological order
        uniqueMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        console.log('Combined unique messages count:', uniqueMessages.length);
        setMessages(uniqueMessages);
      } else if (mappedMessages.length > 0) {
        setMessages(mappedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      
      // If database load fails, try to load from localStorage as a fallback
      if (currentChat) {
        const localMessages = loadMessagesFromLocalStorage(currentChat.id);
        if (localMessages.length > 0) {
          console.log('Database load failed, using localStorage messages:', localMessages.length);
          setMessages(localMessages);
        }
      }
    }
  }, [supabase, messages, currentChat, loadMessagesFromLocalStorage]);

  // Memoize loadChats function
  const loadChats = useCallback(async () => {
    try {
      console.log('Loading chats...');
      const { data: chatsData, error } = await supabase
        .from('chats')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      console.log(`Loaded ${chatsData.length} chats`);
      setChats(chatsData);
      setFilteredChats(chatsData);
      
      // If there's no current chat but we have chats, select the first one
      if (chatsData.length > 0 && !currentChat) {
        console.log('No current chat selected, selecting first chat:', chatsData[0].id);
        setCurrentChat(chatsData[0]);
      } else if (currentChat) {
        // If we have a current chat, make sure it still exists in the loaded chats
        const chatStillExists = chatsData.some(chat => chat.id === currentChat.id);
        if (!chatStillExists && chatsData.length > 0) {
          console.log('Current chat no longer exists, selecting first chat:', chatsData[0].id);
          setCurrentChat(chatsData[0]);
        }
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [supabase, currentChat]);

  const autoResizeTextField = useCallback(() => {
    const textarea = textFieldRef.current;
    if (textarea) {
      // Only resize if content exceeds single line
      const lineHeight = 20; // Approximate line height
      const padding = 20; // Total vertical padding
      const scrollHeight = textarea.scrollHeight - padding;
      
      if (scrollHeight <= lineHeight) {
        textarea.style.height = '40px';
      } else {
        const newHeight = Math.min(textarea.scrollHeight, isMobile ? 120 : 200);
        textarea.style.height = `${newHeight}px`;
      }
    }
  }, [isMobile]);

  useEffect(() => {
    autoResizeTextField();
  }, [newMessage, autoResizeTextField]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add debug logging for messages
  useEffect(() => {
    console.log('Messages state updated:', messages);
    console.log('Messages state length:', messages.length);
    if (messages.length > 0) {
      console.log('First message:', messages[0]);
      console.log('Last message:', messages[messages.length - 1]);
      
      // Count user vs assistant messages
      const userMessages = messages.filter(m => m.sender === 'user').length;
      const assistantMessages = messages.filter(m => m.sender === 'assistant').length;
      console.log(`Message counts - User: ${userMessages}, Assistant: ${assistantMessages}`);
      
      // Check if messages have chat_id
      const messagesWithChatId = messages.filter(m => m.chat_id).length;
      console.log(`Messages with chat_id: ${messagesWithChatId}/${messages.length}`);
    }
  }, [messages]);

  // Add viewport height adjustment for mobile
  useEffect(() => {
    const adjustViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    adjustViewportHeight();
    window.addEventListener('resize', adjustViewportHeight);
    window.addEventListener('orientationchange', adjustViewportHeight);

    return () => {
      window.removeEventListener('resize', adjustViewportHeight);
      window.removeEventListener('orientationchange', adjustViewportHeight);
    };
  }, []);

  // Load messages when chat changes
  useEffect(() => {
    if (currentChat && !isProcessingMessage) {
      console.log('Current chat changed, loading messages for:', currentChat.id);
      // Don't include the messages check here as it causes issues
      loadMessages(currentChat.id);
    } else if (!currentChat && messages.length > 0) {
      // Only clear messages if there's no current chat AND we have messages to clear
      console.log('No current chat, clearing messages');
      setMessages([]);
    } else {
      console.log('Skipping message reload because a message is being processed or no messages to clear');
    }
  }, [currentChat, loadMessages, isProcessingMessage, messages.length]);

  // Make sure sidebar is visible on desktop
  useEffect(() => {
    if (!isMobile) {
      setShowSidebar(true);
    }
  }, [isMobile]);

  // Ensure chat list is loaded when user is authenticated
  useEffect(() => {
    if (user) {
      console.log('User authenticated, loading chats');
      loadChats();
    }
  }, [user, loadChats]);

  // Reload chats when sidebar is shown on mobile
  useEffect(() => {
    if (showSidebar && isMobile) {
      console.log('Sidebar shown on mobile, refreshing chat list');
      loadChats();
    }
  }, [showSidebar, isMobile, loadChats]);

  // Filter chats when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredChats(
        chats.filter(chat => 
          chat.title.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, chats]);

  const createNewChat = async () => {
    // Check if user is logged in first
    if (!user) {
      setNotification({ type: 'error', message: t('auth.signInPrompt') });
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    // If we already have a current chat with no messages, don't create a new one
    if (currentChat && messages.length === 0) {
      return;
    }

    try {
      // Check if the current chat has any messages
      if (currentChat) {
        const { data: currentMessages } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('chat_id', currentChat.id)
          .limit(1);

        // If current chat has no messages, just keep using it
        if (!currentMessages || currentMessages.length === 0) {
          return;
        }
      }

      // Check for any existing empty chats
      for (const chat of chats) {
        const { data: chatMessages } = await supabase
          .from('chat_messages')
          .select('id')
          .eq('chat_id', chat.id)
          .limit(1);

        // If we find an empty chat, use it instead of creating a new one
        if (!chatMessages || chatMessages.length === 0) {
          setCurrentChat(chat);
          setMessages([]);
          return;
        }
      }

      // If no empty chats found, create a new one
      console.log('Creating new chat from button click...');
      const { data: chat, error } = await supabase
        .from('chats')
        .insert([{ 
          user_id: user.id,
          title: 'New Chat'
        }])
        .select()
        .single();

      if (error) throw error;
      if (!chat) throw new Error('Failed to create new chat');

      console.log('New chat created successfully:', chat);
      setChats(prev => [chat, ...prev]);
      setCurrentChat(chat);
      // Only clear messages if we're actually switching to a new chat
      if (!currentChat || currentChat.id !== chat.id) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create new chat. Please try again.');
    }
  };

  // Add a function to validate message data
  const validateMessageData = (messageData: MessageData): string | null => {
    if (!messageData.chat_id) {
      return 'Missing chat_id';
    }
    if (!messageData.sender) {
      return 'Missing sender';
    }
    if (messageData.sender !== 'user' && messageData.sender !== 'assistant') {
      return `Invalid sender: ${messageData.sender}. Must be 'user' or 'assistant'`;
    }
    if (messageData.content === undefined || messageData.content === null) {
      return 'Missing content';
    }
    return null; // No validation errors
  };

  // Utility function to check if an error object is meaningful
  const isErrorMeaningful = (error: Error | SupabaseError | null | unknown): boolean => {
    if (!error) return false;
    
    if (error instanceof Error) {
      return true;
    }
    
    if (typeof error === 'object') {
      return Object.keys(error as object).length > 0 && 
             ((error as SupabaseError).code !== undefined || 
              (error as SupabaseError).message !== undefined || 
              (error as SupabaseError).details !== undefined);
    }
    
    return false;
  };

  const saveMessage = async (message: Message, chatId: string) => {
    try {
      console.log('Saving message to chat ID:', chatId);
      
      if (!chatId) {
        throw new Error('Chat ID is undefined or empty');
      }
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session found. User may not be authenticated.');
      }
      
      // Verify the user has access to this chat
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('id, user_id')
        .eq('id', chatId)
        .single();
        
      if (isErrorMeaningful(chatError)) {
        console.error('Error verifying chat access:', chatError);
        const errorMessage = chatError && typeof chatError === 'object' && chatError.message 
          ? chatError.message 
          : 'Unknown error';
        throw new Error(`Cannot access chat with ID ${chatId}: ${errorMessage}`);
      }
      
      if (!chatData) {
        throw new Error(`Chat with ID ${chatId} not found`);
      }
      
      if (chatData.user_id !== session.user.id) {
        throw new Error(`User ${session.user.id} does not have permission to access chat ${chatId}`);
      }
      
      // Log the message data being sent to Supabase
      const messageData = {
        chat_id: chatId,
        sender: message.sender,
        content: message.text || '',
        image_url: message.image
      };
      console.log('Message data to insert:', messageData);
      
      // Validate message data
      const validationError = validateMessageData(messageData);
      if (validationError) {
        throw new Error(`Invalid message data: ${validationError}`);
      }
      
      // Based on the RLS policies, we need to use a different approach
      // Looking at the Supabase RLS policies, we need to match the "Users can insert messages to their chats" policy
      console.log('Inserting message without select...');
      const { error } = await supabase
        .from('chat_messages')
        .insert([messageData]);
      
      if (error && error.code === '42501') {
        console.warn('Permission denied (RLS policy violation). This is likely due to RLS policies.');
        console.warn('The current RLS policy requires the user to own the chat.');
        
        // Don't throw an error for this specific case, as the UI should continue to function
        // The message will still appear in the UI even if it's not saved to the database
        return;
      } else if (isErrorMeaningful(error)) {
        console.error('Error inserting message:', error);
        throw error;
      }
      
      console.log('Message inserted successfully');
      
      // Update chat's updated_at timestamp
      const { error: updateError } = await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);
        
      if (isErrorMeaningful(updateError)) {
        console.error('Error updating chat timestamp:', updateError);
        if (updateError && typeof updateError === 'object') {
          if (updateError.code) console.error('Update error code:', updateError.code);
          if (updateError.message) console.error('Update error message:', updateError.message);
        }
      }
    } catch (error) {
      // Only log and rethrow if it's a real error
      if (isErrorMeaningful(error)) {
        console.error('Error in saveMessage function:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        } else {
          console.error('Unknown error type:', typeof error);
        }
        throw error; // Re-throw the error so it can be caught by the caller
      } else {
        // Just log a warning for empty error objects
        console.warn('Caught empty error object when saving message');
      }
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Image selected:', file.name);
      setSelectedImage(file);
      handleSendMessage(undefined, file);
    }
  };

  // Add a function to safely update messages
  const safelyUpdateMessages = useCallback((newMessage: Message) => {
    console.log('Safely updating messages with:', newMessage);
    // Store the current messages plus the new message in the ref
    pendingMessagesRef.current = [...messages, newMessage];
    
    // Update the state
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages, newMessage];
      console.log('Updated messages:', updatedMessages);
      return updatedMessages;
    });
  }, [messages]);
  
  // Add a function to restore pending messages if they get lost
  const restorePendingMessages = useCallback(() => {
    if (pendingMessagesRef.current.length > 0 && 
        (messages.length === 0 || 
         pendingMessagesRef.current.length > messages.length)) {
      console.log('Restoring pending messages:', pendingMessagesRef.current);
      setMessages(pendingMessagesRef.current);
    }
  }, [messages]);
  
  // Check if we need to restore messages after any state update
  useEffect(() => {
    if (isProcessingMessage && messages.length < pendingMessagesRef.current.length) {
      console.log('Message count decreased during processing, restoring pending messages');
      restorePendingMessages();
    }
  }, [messages, isProcessingMessage, restorePendingMessages]);

  const handleSendMessage = async (e?: React.FormEvent, imageFile?: File) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newMessage.trim() && !imageFile && !user) return;

    // Check if user is authenticated
    if (!user) {
      setNotification({ type: 'error', message: t('auth.signInPrompt') });
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return;
    }

    // Set the processing flag to prevent message reloading
    setIsProcessingMessage(true);

    let chatId: string;
    let isNewChat = false;
    
    // Create a new chat if there isn't one
    if (!currentChat) {
      try {
        console.log('Creating new chat...');
        const { data: chat, error } = await supabase
          .from('chats')
          .insert([{ 
            user_id: user.id,
            title: newMessage.slice(0, 50) + (newMessage.length > 50 ? '...' : '')
          }])
          .select()
          .single();

        if (error) {
          console.error('Error creating new chat:', error);
          throw error;
        }
        if (!chat) {
          console.error('No chat data returned after creation');
          throw new Error('Failed to create new chat');
        }

        console.log('New chat created:', chat);
        chatId = chat.id;
        isNewChat = true;
        setChats(prev => [chat, ...prev]);
        setCurrentChat(chat);
      } catch (error) {
        console.error('Error creating chat:', error);
        setNotification({ type: 'error', message: 'Failed to create new chat. Please try again.' });
        return;
      }
    } else {
      console.log('Using existing chat:', currentChat.id);
      chatId = currentChat.id;
    }

    // Validate chat ID
    if (!chatId) {
      console.error('Chat ID is undefined or empty');
      setNotification({ type: 'error', message: 'Invalid chat ID. Please try again.' });
      return;
    }

    const messageId = Date.now().toString();
    let imageUrl = '';

    // Handle image upload
    if (imageFile) {
      try {
        console.log('Uploading image...');
        
        // Ensure user is still authenticated
        if (!user || !user.id) {
          throw new Error('User not authenticated for image upload');
        }
        
        const filePath = `chat/${user.id}/${messageId}`;
        console.log('Uploading to path:', filePath);
        
        // Upload the file directly without checking bucket
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type
          });

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          console.error('Upload error code:', uploadError.message);
          throw uploadError;
        }
        
        if (!uploadData) {
          console.warn('No upload data returned');
          throw new Error('No upload data returned from Supabase');
        }
        
        console.log('Upload successful:', uploadData);

        // Get the public URL using the storage API
        const { data: urlData } = await supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        if (!urlData?.publicUrl) {
          console.error('Failed to get public URL');
          throw new Error('Failed to get public URL for uploaded image');
        }

        // Ensure the URL uses HTTPS and add cache control
        const timestamp = new Date().getTime();
        let publicUrl = urlData.publicUrl.replace('http://', 'https://');
        
        // Log the raw URL for debugging
        console.log('Raw public URL from Supabase:', publicUrl);
        
        // Check if URL matches the pattern in next.config.ts
        const supabaseUrlPattern = /^https:\/\/vjfsascagdencbewveoz\.supabase\.co\/storage\/v1\/object\/public\//;
        if (!supabaseUrlPattern.test(publicUrl)) {
          console.warn('URL may not match the pattern in next.config.ts:', publicUrl);
          console.warn('Expected pattern: https://vjfsascagdencbewveoz.supabase.co/storage/v1/object/public/...');
          
          // Try to fix the URL if it doesn't match the expected pattern
          if (publicUrl.includes('supabase.co') && publicUrl.includes('storage/v1/object')) {
            console.log('Attempting to fix URL format...');
            // Extract the important parts and reconstruct the URL
            const urlParts = publicUrl.split('/');
            const bucketIndex = urlParts.findIndex(part => part === 'object') + 1;
            if (bucketIndex > 0 && bucketIndex < urlParts.length) {
              const bucket = urlParts[bucketIndex];
              const pathParts = urlParts.slice(bucketIndex + 1);
              const newUrl = `https://vjfsascagdencbewveoz.supabase.co/storage/v1/object/public/${bucket}/${pathParts.join('/')}`;
              console.log('Fixed URL:', newUrl);
              publicUrl = newUrl;
            }
          }
        } else {
          console.log('URL matches expected pattern in next.config.ts');
        }
        
        // Add cache busting parameter to prevent caching issues
        imageUrl = publicUrl.includes('?') 
          ? `${publicUrl}&_cb=${timestamp}` 
          : `${publicUrl}?_cb=${timestamp}`;
        
        console.log('Final image URL with cache busting:', imageUrl);
        
        // Validate the URL is properly formatted
        try {
          new URL(imageUrl);
          console.log('Image URL is valid');
        } catch (error) {
          console.error('Invalid image URL format:', error);
          throw new Error('Invalid image URL format');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Error uploading image: ${error instanceof Error ? error.message : 'Something went wrong'}. Please try again.`,
          sender: 'assistant',
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }
    }

    // Create and add user message
    const userMessage: Message = {
      id: messageId,
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      chat_id: chatId,
      ...(imageUrl && { image: imageUrl })
    };

    console.log('Adding user message to UI:', userMessage);
    console.log('Current messages state before adding:', messages);
    
    // Use the safe update function instead of directly setting state
    safelyUpdateMessages(userMessage);
    
    setNewMessage('');
    setIsLoading(true);

    // Save user message to database
    try {
      await saveMessage(userMessage, chatId);
      console.log('User message saved to database successfully');
    } catch (error) {
      // Only log meaningful errors
      if (isErrorMeaningful(error)) {
        console.error('Failed to save user message:', error);
      } else {
        console.warn('Empty error object when saving user message');
      }
      // Continue with the conversation even if saving fails
    }

    try {
      console.log('Fetching AI response...');
      
      // Ensure user is still authenticated
      if (!user || !user.id) {
        throw new Error('User not authenticated when sending message to API');
      }
      
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('userId', user.id);
        formData.append('message', newMessage || '');
        formData.append('chatId', chatId);
        formData.append('context', JSON.stringify(messages.slice(-5)));

        console.log('Sending image message to API with chat ID:', chatId);
        response = await fetch('/api/chat', {
          method: 'POST',
          body: formData
        });
      } else {
        console.log('Sending text message to API with chat ID:', chatId);
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: newMessage, 
            userId: user.id,
            chatId: chatId,
            context: messages.slice(-5)
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API response error:', errorData);
        throw new Error(errorData.error || `Failed to get response: ${response.status} ${response.statusText}`);
      }

      const data = await response.json().catch(() => {
        throw new Error('Failed to parse API response');
      });
      
      if (!data || !data.reply) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response from API');
      }
      
      console.log('Received AI response:', data);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'assistant',
        timestamp: new Date(),
        chat_id: chatId
      };

      console.log('Adding assistant message to UI:', assistantMessage);
      // Use the safe update function for the assistant message too
      safelyUpdateMessages(assistantMessage);
      
      // Save assistant message to database using the same chatId
      try {
        await saveMessage(assistantMessage, chatId);
      } catch (error) {
        // Only log meaningful errors
        if (isErrorMeaningful(error)) {
          console.error('Failed to save assistant message:', error);
        } else {
          console.warn('Empty error object when saving assistant message');
        }
        // Continue with the conversation even if saving fails
      }

      // Update chat title if it's a new chat and we have a text message
      if (isNewChat && newMessage.trim()) {
        console.log('Updating chat title...');
        const title = newMessage.slice(0, 50) + (newMessage.length > 50 ? '...' : '');
        await supabase
          .from('chats')
          .update({ title })
          .eq('id', chatId);
          
        setChats(prev => prev.map(chat => 
          chat.id === chatId ? { ...chat, title } : chat
        ));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error instanceof Error ? error.message : 'Something went wrong. Please try again.'}`,
        sender: 'assistant',
        timestamp: new Date(),
        chat_id: chatId
      };
      
      // Use the safe update function for the error message
      safelyUpdateMessages(errorMessage);
      
      // Save error message to database
      try {
        await saveMessage(errorMessage, chatId);
      } catch (saveError) {
        console.error('Failed to save error message:', saveError);
      }
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      // Reset the processing flag after everything is done
      setIsProcessingMessage(false);
      // Clear the pending messages ref
      pendingMessagesRef.current = [];
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add a function to handle message time display
  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    if (now.toDateString() === messageDate.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Fix translation keys
  const TRANSLATION_KEYS = {
    chats: 'navigation.chat',
    newChat: 'recipe.create',
    typeMessage: 'common.typeMessage',
    send: 'common.send',
    scan: 'navigation.scan',
    save: 'common.save'
  } as const;

  const deleteChat = async (chatId: string) => {
    try {
      console.log('Deleting chat:', chatId);
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) throw error;

      // Update local state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If the deleted chat was the current chat, select another one
      if (currentChat?.id === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChat(remainingChats[0]);
        } else {
          setCurrentChat(null);
        }
      }

      // Close the options menu
      setChatOptionsAnchorEl(null);
      
      console.log('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const handleChatMenuClose = () => {
    setChatMenuAnchorEl(null);
  };

  const handleChatOptionsOpen = (event: React.MouseEvent<HTMLButtonElement>, chatId: string) => {
    setChatOptionsAnchorEl(event.currentTarget);
    setSelectedChatForOptions(chatId);
  };

  const handleChatOptionsClose = () => {
    setChatOptionsAnchorEl(null);
    setSelectedChatForOptions(null);
  };

  const handleChatSelect = (chat: Chat) => {
    console.log('Selecting chat:', chat.id);
    setCurrentChat(chat);
    
    // On mobile, hide the sidebar after selecting a chat
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleSaveRecipe = async (message: Message) => {
    setIsLoading(true);
    try {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to save recipes');
      }

      // Parse the meal information from the message text
      const mealInfo = extractMealInfo(message.text);
      
      if (!mealInfo) {
        throw new Error('Could not parse meal information');
      }

      console.log('Attempting to save meal with info:', mealInfo);

      // Insert the meal with all the parsed information
      const { data, error } = await supabase
        .from('meals')
        .insert([
          {
            user_id: user.id,
            title: mealInfo.title,
            description: mealInfo.description,
            type: 'dinner', // Default to dinner since we don't parse meal type
            nutritional_info: mealInfo.nutritional_info,
            ingredients: mealInfo.ingredients,
            instructions: mealInfo.instructions,
            cooking_time: mealInfo.cooking_time,
            servings: mealInfo.servings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving meal:', error);
        throw error;
      }

      console.log('Meal saved successfully:', data);
      setNotification({ type: 'success', message: t('notifications.mealSaved') });
    } catch (error: unknown) {
      console.error('Error saving meal:', error);
      setNotification({ type: 'error', message: t('notifications.errorSavingMeal') });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a function to add a test message directly to the UI
  const addTestMessage = () => {
    if (currentChat) {
      console.log('Adding test message to UI');
      const testMessage: Message = {
        id: `test-${Date.now()}`,
        text: 'This is a test message to verify the UI is working.',
        sender: 'assistant',
        timestamp: new Date(),
        chat_id: currentChat.id
      };
      
      setMessages(prev => {
        console.log('Previous messages before adding test message:', prev);
        const updatedMessages = [...prev, testMessage];
        console.log('Updated messages with test message:', updatedMessages);
        return updatedMessages;
      });
    } else {
      console.error('No current chat to add test message to');
    }
  };

  // Fix the extractMealInfo function
  const extractMealInfo = (text: string) => {
    interface Ingredient {
      name: string;
      amount: number;
      unit: string;
    }

    interface Instruction {
      text: string;
      duration: number | null;
      timer_required: boolean;
    }

    interface MealInfo {
      title: string;
      ingredients: Ingredient[];
      instructions: Instruction[];
      cooking_time: number;
      servings: number;
      description: string;
      nutritional_info: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      };
    }

    // Look for ingredients section with more flexible pattern matching
    const ingredientsMatch = text.match(/ingredients:?[\s\S]*?(?=instructions:?|$)/i);
    const instructionsMatch = text.match(/instructions:?[\s\S]*?(?=(?:cooking time|$))/i);
    
    // Extract ingredients with improved parsing
    const ingredients: Ingredient[] = ingredientsMatch ? ingredientsMatch[0]
      .replace(/ingredients:?/i, '') // Remove the "Ingredients:" header
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.toLowerCase().includes('ingredients'))
      .map(line => {
        // Remove bullet points, asterisks, and other list markers
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        if (!cleanLine) return null;

        // Try to parse amount, unit, and name with more flexible pattern
        const match = cleanLine.match(/^([0-9½¼¾⅓⅔]+(?:\/[0-9]+)?(?:\.[0-9]+)?(?:\s*-\s*[0-9]+)?)\s*([a-zA-Z]+)?\s*(.+)$/);
        
        if (match) {
          // Convert fractions and special characters to decimal numbers
          let amount = 1;
          try {
            const rawAmount = match[1]
              .replace('½', '0.5')
              .replace('¼', '0.25')
              .replace('¾', '0.75')
              .replace('⅓', '0.33')
              .replace('⅔', '0.67');
              
            // Handle ranges (e.g., "2-3") by taking the average
            if (rawAmount.includes('-')) {
              const [min, max] = rawAmount.split('-').map(n => parseFloat(n.trim()));
              amount = (min + max) / 2;
            } else {
              amount = rawAmount.includes('/') ? 
                eval(rawAmount) : 
                parseFloat(rawAmount);
            }
          } catch (e) {
            console.error('Error parsing ingredient amount:', e);
            amount = 1;
          }
          
          const ingredient: Ingredient = {
            name: match[3].trim(),
            amount: isNaN(amount) ? 1 : amount,
            unit: match[2]?.toLowerCase() || 'piece'
          };
          
          return ingredient.name ? ingredient : null;
        }
        
        // If no pattern matches, just use the line as the ingredient name
        const ingredient: Ingredient = {
          name: cleanLine,
          amount: 1,
          unit: 'piece'
        };
        
        return ingredient.name ? ingredient : null;
      })
      .filter((ing): ing is Ingredient => 
        ing !== null && typeof ing.name === 'string' && ing.name !== '*'
      ) : [];

    // Extract instructions with improved parsing
    const instructions: Instruction[] = instructionsMatch ? instructionsMatch[0]
      .replace(/instructions:?/i, '') // Remove the "Instructions:" header
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.toLowerCase().includes('instructions'))
      .map(line => {
        const text = line.replace(/^(?:\d+\.\s*|[-•*]\s*)/, '').trim();
        if (!text) return null;
        
        // Try to find duration in the step
        const durationMatch = text.match(/(\d+)[\s-]*(minutes?|mins?|hours?)/i);
        const duration = durationMatch ? 
          (durationMatch[2].toLowerCase().startsWith('hour') ? 
            parseInt(durationMatch[1]) * 60 : 
            parseInt(durationMatch[1])) : 
          null;

        const instruction: Instruction = {
          text,
          duration: duration,
          timer_required: duration !== null
        };
        return instruction;
      })
      .filter((inst): inst is Instruction => inst !== null) : [];

    // Try to find a title
    const titleMatch = text.match(/\*\*([^*]+)\*\*/) || // Match text between ** **
                    text.match(/^([^\n]+)(?=\n+ingredients:)/i) || 
                    text.match(/^(?:\*\*)?([^*\n]+)(?:\*\*)?\s*$/m);
    const title = titleMatch ? titleMatch[1].trim() : 'New Recipe';

    // Try to find cooking time
    const timeMatch = text.match(/(?:cooking time|time):\s*(?:approximately\s*)?(\d+)\s*(?:minutes?|mins?|hours?)/i);
    const cookingTime = timeMatch ? 
      (timeMatch[0].toLowerCase().includes('hour') ? 
        parseInt(timeMatch[1]) * 60 : 
        parseInt(timeMatch[1])) : 
      30;

    // Create a clean description
    const description = text
      .replace(/ingredients:[\s\S]*?(?=instructions:|$)/i, '')
      .replace(/instructions:[\s\S]*?(?=cooking time:|$)/i, '')
      .replace(/cooking time:.*$/i, '')
      .trim();

    // Only return if we have both ingredients and instructions
    if (ingredients.length > 0 && instructions.length > 0) {
      const mealInfo: MealInfo = {
        title,
        ingredients,
        instructions,
        cooking_time: cookingTime,
        servings: 4,
        description,
        nutritional_info: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }
      };
      return mealInfo;
    }
    return null;
  };

  return (
    <Box 
      sx={{ 
        height: '100dvh',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#0A1929',
      }}
    >
      {/* Notification Snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={6000}
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 90, sm: 24 } }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={notification?.type || 'info'}
          onClose={() => setNotification(null)}
          sx={{ display: notification ? 'flex' : 'none' }}
        >
          {notification?.message}
        </MuiAlert>
      </Snackbar>

      {/* Chat List Sidebar */}
      {(showSidebar || !isMobile) && (
        <Box
          sx={{
            width: isMobile ? '100%' : 300,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            bgcolor: theme.palette.mode === 'light' ? 
              alpha(theme.palette.background.paper, 0.8) : 
              alpha(theme.palette.background.paper, 0.8),
            display: 'flex',
            flexDirection: 'column',
            position: isMobile ? 'fixed' : 'relative',
            top: 0,
            left: 0,
            bottom: 0,
            zIndex: 1100,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {/* Sidebar Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              position: 'sticky',
              top: 0,
              bgcolor: theme.palette.mode === 'light' ? 
                alpha(theme.palette.background.paper, 0.95) : 
                alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(8px)',
              zIndex: 1200,
              minHeight: 64,
              boxShadow: `0 1px 2px ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                  onClick={() => {
                    router.push('/');
                  }}
                  sx={{ mr: 2 }}
                >
                  <ArrowBackIcon />
                </IconButton>
                
                <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
                  Chat
                </Typography>
              </Box>

              {!isMobile && (
                <Button
                  variant="contained"
                  onClick={createNewChat}
                  startIcon={<AddIcon />}
                  sx={{ 
                    textTransform: 'none',
                    px: 2,
                    py: 1,
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                    },
                  }}
                >
                  New Chat
                </Button>
              )}
            </Box>
          </Box>
          
          {/* Search Box */}
          <Box 
            sx={{ 
              p: 2, 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'sticky',
              top: 64,
              bgcolor: theme.palette.mode === 'light' ? 
                alpha(theme.palette.background.paper, 0.95) : 
                alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(8px)',
              zIndex: 9,
              boxShadow: `0 1px 2px ${alpha(theme.palette.divider, 0.05)}`,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'light' ? 
                    alpha(theme.palette.common.black, 0.03) : 
                    alpha(theme.palette.common.white, 0.03),
                }
              }}
            />
          </Box>

          {/* New Chat Button */}
          {!isMobile && (
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Button
                fullWidth
                variant="contained"
                onClick={createNewChat}
                startIcon={<AddIcon />}
                sx={{ 
                  py: 1,
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                New Chat
              </Button>
            </Box>
          )}
          
          {/* Chat List */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              pt: 2,
              mt: 0,
              pb: 4,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.text.primary, 0.2),
                borderRadius: '3px',
              },
            }}
          >
            {filteredChats.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </Box>
            )}
            {filteredChats.map((chat) => (
              <Paper
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: currentChat?.id === chat.id ?
                    alpha(theme.palette.primary.main, 0.08) :
                    'transparent',
                  border: `1px solid ${alpha(
                    currentChat?.id === chat.id ?
                      theme.palette.primary.main :
                      theme.palette.divider,
                    0.1
                  )}`,
                  borderRadius: 2,
                  '&:hover': {
                    bgcolor: currentChat?.id === chat.id ?
                      alpha(theme.palette.primary.main, 0.12) :
                      alpha(theme.palette.action.hover, 0.1),
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: currentChat?.id === chat.id ? 700 : 500,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '85%',
                      color: currentChat?.id === chat.id ? 'primary.main' : 'text.primary',
                    }}
                  >
                    {chat.title}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleChatOptionsOpen(e, chat.id)}
                    sx={{ 
                      p: 0.5, 
                      ml: 'auto',
                      opacity: 0.6,
                      '&:hover': { opacity: 1 }
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                  }}
                >
                  {new Date(chat.updated_at).toLocaleDateString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      )}

      {/* Chat Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          visibility: (isMobile && showSidebar) ? 'hidden' : 'visible',
          pt: '56px', // Add padding at the top to account for the main navbar
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: isMobile ? 2 : 4,
            py: 2,
            bgcolor: theme.palette.mode === 'light' ? 
              alpha(theme.palette.background.paper, 0.8) : 
              alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            minHeight: isMobile ? 56 : 64,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <IconButton 
              onClick={() => {
                console.log('Showing sidebar');
                setShowSidebar(true);
                // Force refresh the chat list when showing sidebar
                loadChats();
              }}
              sx={{ 
                color: 'text.primary',
                mr: 2,
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              component="h1"
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                flex: 1,
                whiteSpace: 'nowrap',
              }}
            >
              Chat Assistant
            </Typography>
            
            {/* Add debug buttons */}
            <Box sx={{ display: 'flex' }}>
              <IconButton
                onClick={() => {
                  console.log('Debug - Current messages:', messages);
                  console.log('Debug - Current chat:', currentChat);
                  
                  // Force refresh messages
                  if (currentChat) {
                    console.log('Debug - Forcing message refresh for chat:', currentChat.id);
                    loadMessages(currentChat.id);
                  }
                }}
                sx={{ ml: 1 }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
              
              {/* Add a test message button */}
              <IconButton
                onClick={addTestMessage}
                sx={{ ml: 1 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        {/* Spacer for extra padding below header */}
        <Box sx={{ height: 16 }} />
        
        {/* Chat Switcher Menu */}
        <Menu
          anchorEl={chatMenuAnchorEl}
          open={Boolean(chatMenuAnchorEl)}
          onClose={handleChatMenuClose}
          PaperProps={{
            sx: {
              width: 280,
              maxHeight: 400,
            }
          }}
        >
          <MenuItem 
            onClick={() => {
              createNewChat();
              handleChatMenuClose();
            }}
            sx={{ 
              color: 'primary.main',
              fontWeight: 500,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              py: 1.5,
            }}
          >
            <AddIcon fontSize="small" sx={{ mr: 1 }} />
            New Chat
          </MenuItem>
          
          {chats.length === 0 ? (
            <MenuItem disabled sx={{ color: 'text.secondary', py: 2, justifyContent: 'center' }}>
              No recent chats
            </MenuItem>
          ) : (
            chats.slice(0, 10).map((chat) => (
              <MenuItem 
                key={chat.id}
                onClick={() => {
                  handleChatSelect(chat);
                  handleChatMenuClose();
                }}
                selected={currentChat?.id === chat.id}
                sx={{ 
                  py: 1.5,
                  px: 2,
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  width: '100%',
                  overflow: 'hidden',
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: currentChat?.id === chat.id ? 600 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {chat.title}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      mt: 0.5,
                    }}
                  >
                    {new Date(chat.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </MenuItem>
            ))
          )}
          
          {chats.length > 10 && (
            <MenuItem 
              onClick={() => {
                handleChatMenuClose();
                setShowSidebar(true);
                // Force refresh the chat list
                loadChats();
              }}
              sx={{ 
                justifyContent: 'center', 
                color: 'primary.main',
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                py: 1.5,
              }}
            >
              View all chats
            </MenuItem>
          )}
        </Menu>
        
        {/* Messages Area */}
        <Box 
          sx={{ 
            flex: 1,
            overflowY: 'auto',
            px: isMobile ? 2 : 4,
            py: 3,
            pt: 6,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxWidth: '100%',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            scrollbarColor: `${alpha(theme.palette.text.primary, 0.2)} transparent`,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.text.primary, 0.2),
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.palette.text.primary, 0.3),
            },
          }}
        >
          {messages.length === 0 && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                opacity: 0.7,
                gap: 2,
                py: 4
              }}
            >
              <BotIcon sx={{ fontSize: 48, opacity: 0.5 }} />
              <Typography variant="h6" color="text.secondary">
                Start a new conversation
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                Type a message below to start chatting. Ask me anything about cooking, recipes, or ingredients. I can help you plan meals, suggest recipes, and more.
              </Typography>
            </Box>
          )}
          {messages.map((message) => {
            // Add more detailed logging for each message being rendered
            console.log('Rendering message:', {
              id: message.id,
              sender: message.sender,
              text: message.text?.substring(0, 50) + (message.text?.length > 50 ? '...' : ''),
              timestamp: message.timestamp,
              chat_id: message.chat_id
            });
            
            // Force the sender to be either 'user' or 'assistant' to ensure correct rendering
            const safeSender = message.sender === 'user' ? 'user' : 'assistant';
            
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  flexDirection: safeSender === 'user' ? 'row-reverse' : 'row',
                  gap: 1.5,
                  alignItems: 'flex-start',
                  maxWidth: '100%',
                  mb: 2,
                  px: isMobile ? 0 : 2,
                }}
              >
                <Avatar
                  src={safeSender === 'user' && user?.user_metadata?.avatar_url ? user.user_metadata.avatar_url : undefined}
                  sx={{
                    bgcolor: safeSender === 'user' ? 
                      alpha(theme.palette.primary.main, 0.9) : 
                      alpha(theme.palette.secondary.main, 0.9),
                    width: 32,
                    height: 32,
                    display: isTablet ? 'none' : 'flex',
                    flexShrink: 0,
                  }}
                >
                  {safeSender === 'user' ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    maxWidth: isMobile ? '85%' : '70%',
                    bgcolor: safeSender === 'user' ? 
                      alpha(theme.palette.primary.main, 0.08) : 
                      alpha(theme.palette.background.paper, 0.8),
                    color: theme.palette.text.primary,
                    borderRadius: 2,
                    position: 'relative',
                    wordBreak: 'break-word',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(
                      safeSender === 'user' ? 
                        theme.palette.primary.main : 
                        theme.palette.divider,
                      0.1
                    )}`,
                    opacity: 1,
                    visibility: 'visible',
                    '& img': {
                      maxWidth: '100%',
                      height: 'auto',
                      borderRadius: 1,
                      marginTop: 1,
                      marginBottom: 1,
                    },
                    '& pre': {
                      maxWidth: '100%',
                      overflow: 'auto',
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: alpha(theme.palette.action.hover, 0.8),
                      WebkitOverflowScrolling: 'touch',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    },
                    '& code': {
                      fontFamily: 'monospace',
                      bgcolor: alpha(theme.palette.action.hover, 0.8),
                      p: 0.5,
                      borderRadius: 0.5,
                      fontSize: '0.875rem',
                    },
                    '& p': {
                      lineHeight: 1.6,
                      margin: '0.5em 0',
                    },
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1,
                  }}>
                    {message.image && (
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          minHeight: '200px',
                          maxHeight: '300px',
                          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          borderRadius: 1,
                          overflow: 'hidden',
                          bgcolor: alpha(theme.palette.background.paper, 0.5),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Loading indicator */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.background.paper, 0.8),
                            zIndex: 1,
                          }}
                          id={`loading-${message.id}`}
                        >
                          <CircularProgress size={24} />
                        </Box>
                        
                        {/* Direct img tag for reliable display */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={message.image}
                          alt="Uploaded content"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '300px',
                            objectFit: 'contain',
                            zIndex: 2,
                          }}
                          onLoad={() => {
                            // Hide loading indicator when image loads
                            const loadingIndicator = document.getElementById(`loading-${message.id}`);
                            if (loadingIndicator) {
                              loadingIndicator.style.display = 'none';
                            }
                            console.log('Image loaded successfully:', message.image);
                          }}
                          onError={(e) => {
                            console.error('Error loading image:', message.image);
                            
                            // Check if URL matches the pattern in next.config.ts
                            const imageUrl = message.image || '';
                            const supabaseUrlPattern = /^https:\/\/vjfsascagdencbewveoz\.supabase\.co\/storage\/v1\/object\/public\//;
                            if (!supabaseUrlPattern.test(imageUrl)) {
                              console.error('URL does not match the pattern in next.config.ts:', imageUrl);
                            }
                            
                            // Hide loading indicator and show error
                            const loadingIndicator = document.getElementById(`loading-${message.id}`);
                            if (loadingIndicator) {
                              loadingIndicator.style.display = 'none';
                            }
                            
                            // Show error message in the image container
                            const imgElement = e.target as HTMLImageElement;
                            const parent = imgElement.parentElement;
                            if (parent) {
                              const errorElement = document.createElement('div');
                              errorElement.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                width: 100%;
                                height: 100%;
                                padding: 20px;
                                text-align: center;
                                color: #666;
                                z-index: 2;
                              `;
                              errorElement.innerHTML = `
                                <span style="font-size: 24px; margin-bottom: 8px;">❌</span>
                                <span>Image failed to load</span>
                                <span style="font-size: 10px; margin-top: 4px; opacity: 0.7;">
                                  ${imageUrl.substring(0, 50)}${imageUrl.length > 50 ? '...' : ''}
                                </span>
                              `;
                              parent.appendChild(errorElement);
                            }
                          }}
                        />
                      </Box>
                    )}
                    {message.text && (
                      <Box sx={{ width: '100%' }}>
                        <ReactMarkdown>{message.text || ''}</ReactMarkdown>
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 1,
                    mt: 1
                  }}>
                    {safeSender === 'assistant' && (function() {
                      // Simplified meal content detection
                      const mealInfo = extractMealInfo(message.text);
                      
                      // Show button if it looks like a meal description
                      const hasValidContent = mealInfo !== null;

                      return hasValidContent ? (
                        <Tooltip title="Add to my meals" placement="top">
                          <IconButton
                            size={isMobile ? "small" : "medium"}
                            onClick={async () => {
                              try {
                                // Format ingredients properly
                                const formattedIngredients = mealInfo.ingredients.map(ing => ({
                                  name: ing.name,
                                  amount: typeof ing.amount === 'number' ? ing.amount : parseFloat(ing.amount) || 1,
                                  unit: ing.unit || 'piece'
                                }));

                                // Format instructions properly
                                const formattedInstructions = mealInfo.instructions.map(inst => ({
                                  text: inst.text,
                                  duration: inst.duration || null,
                                  timer_required: inst.timer_required || false
                                }));

                                console.log('Saving meal with data:', {
                                  title: mealInfo.title,
                                  ingredients: formattedIngredients,
                                  instructions: formattedInstructions
                                });

                                await handleSaveRecipe(message);
                              } catch (error: unknown) {
                                console.error('Error saving meal:', error);
                                setNotification({ type: 'error', message: t('notifications.errorSavingMeal') });
                              }
                            }}
                            sx={{
                              opacity: 0.8,
                              backgroundColor: theme.palette.mode === 'light' ? 
                                alpha(theme.palette.primary.main, 0.08) : 
                                alpha(theme.palette.primary.main, 0.15),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                              color: theme.palette.primary.main,
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                opacity: 1,
                                backgroundColor: theme.palette.mode === 'light' ? 
                                  alpha(theme.palette.primary.main, 0.12) : 
                                  alpha(theme.palette.primary.main, 0.25),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                              },
                              '&:active': {
                                transform: 'translateY(0)'
                              },
                              ml: 1,
                              flexShrink: 0,
                              backdropFilter: 'blur(8px)'
                            }}
                          >
                            <AddIcon 
                              fontSize={isMobile ? "small" : "medium"}
                              sx={{ 
                                transition: 'transform 0.2s ease',
                                '& > *': { strokeWidth: 2 }
                              }} 
                            />
                          </IconButton>
                        </Tooltip>
                      ) : null;
                    })()}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      bottom: -20,
                      right: safeSender === 'user' ? 'auto' : 8,
                      left: safeSender === 'user' ? 8 : 'auto',
                      color: alpha(theme.palette.text.secondary, 0.8),
                      fontSize: isMobile ? '0.7rem' : '0.75rem',
                      whiteSpace: 'nowrap',
                      fontWeight: 500,
                    }}
                  >
                    {formatMessageTime(message.timestamp)}
                  </Typography>
                </Paper>
              </Box>
            );
          })}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 2,
            display: 'flex',
            gap: 1.5,
            bgcolor: theme.palette.mode === 'light' ? 
              alpha(theme.palette.background.paper, 0.8) : 
              alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(10px)',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            position: 'sticky',
            bottom: 0,
            width: '100%',
            zIndex: 1100,
            transition: 'all 0.3s ease',
          }}
        >
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageSelect}
          />
          <Tooltip title={t(TRANSLATION_KEYS.scan)} placement="top">
            <IconButton
              color="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !user}
              sx={{ 
                p: 1,
                height: 40,
                width: 40,
                borderRadius: 2,
                bgcolor: theme.palette.mode === 'light' ? 
                  alpha(theme.palette.primary.main, 0.08) : 
                  alpha(theme.palette.primary.main, 0.15),
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? 
                    alpha(theme.palette.primary.main, 0.12) : 
                    alpha(theme.palette.primary.main, 0.25),
                },
              }}
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          </Tooltip>
          <TextField
            fullWidth
            multiline
            maxRows={6}
            variant="outlined"
            placeholder={t(TRANSLATION_KEYS.typeMessage)}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              autoResizeTextField();
            }}
            disabled={isLoading || !user}
            inputRef={textFieldRef}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.9375rem',
                bgcolor: theme.palette.mode === 'light' ? 
                  alpha(theme.palette.common.black, 0.03) : 
                  alpha(theme.palette.common.white, 0.03),
                transition: 'all 0.2s ease',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                height: '40px',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'light' ? 
                    alpha(theme.palette.common.black, 0.04) : 
                    alpha(theme.palette.common.white, 0.04),
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&.Mui-focused': {
                  bgcolor: theme.palette.background.paper,
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '8px 14px',
                lineHeight: '24px',
                '&::placeholder': {
                  color: alpha(theme.palette.text.primary, 0.4),
                  opacity: 1,
                },
              },
              '& textarea': {
                height: '24px !important',
                overflow: 'hidden',
                '&[rows="1"]': {
                  height: '24px !important',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />
          <Tooltip title={t(TRANSLATION_KEYS.send)} placement="top">
            <span>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || (!newMessage.trim() && !selectedImage) || !user}
                sx={{
                  minWidth: 'unset',
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    bgcolor: theme.palette.primary.dark,
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SendIcon fontSize="small" />
                )}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Mobile New Chat FAB */}
      {isMobile && !showSidebar && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 80, // Position above the input area
            right: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            zIndex: 1200,
          }}
        >
          <Tooltip title="Show all chats" placement="left">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setShowSidebar(true);
                loadChats();
              }}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                boxShadow: theme.shadows[3],
                minWidth: 'unset',
                p: 0,
                '&:hover': {
                  boxShadow: theme.shadows[5],
                },
                bgcolor: alpha(theme.palette.secondary.main, 0.9),
              }}
            >
              <ListIcon fontSize="small" />
            </Button>
          </Tooltip>
          
          <Tooltip title="New chat" placement="left">
            <Button
              variant="contained"
              color="primary"
              onClick={createNewChat}
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                boxShadow: theme.shadows[4],
                minWidth: 'unset',
                p: 0,
                '&:hover': {
                  boxShadow: theme.shadows[6],
                },
                bgcolor: alpha(theme.palette.primary.main, 0.9),
              }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
      )}

      {/* Chat Options Menu */}
      <Menu
        anchorEl={chatOptionsAnchorEl}
        open={Boolean(chatOptionsAnchorEl)}
        onClose={handleChatOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          onClick={() => {
            if (selectedChatForOptions) {
              deleteChat(selectedChatForOptions);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Chat
        </MenuItem>
      </Menu>
    </Box>
  );
} 