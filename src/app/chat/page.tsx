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
  Divider,
  Avatar,
  useTheme,
  Tooltip,
  useMediaQuery,
  Menu,
  MenuItem,
  Badge,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Save as SaveIcon,
  PhotoCamera,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
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
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Add auto-resize functionality for the input
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

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
    if (currentChat) {
      console.log('Current chat changed, loading messages for:', currentChat.id);
      loadMessages(currentChat.id);
    } else {
      // Clear messages if there's no current chat
      console.log('No current chat, clearing messages');
      setMessages([]);
    }
  }, [currentChat]);

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
  }, [user]);

  // Reload chats when sidebar is shown on mobile
  useEffect(() => {
    if (showSidebar && isMobile) {
      console.log('Sidebar shown on mobile, refreshing chat list');
      loadChats();
    }
  }, [showSidebar, isMobile]);

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

  const loadChats = async () => {
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
  };

  const loadMessages = async (chatId: string) => {
    try {
      console.log('Loading messages for chat ID:', chatId);
      const { data: messagesData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      console.log('Loaded messages:', messagesData.length);
      setMessages(messagesData.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender as 'user' | 'assistant',
        timestamp: new Date(msg.created_at),
        image: msg.image_url
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const createNewChat = async () => {
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
          user_id: user!.id,
          title: 'New Chat'
        }])
        .select()
        .single();

      if (error) throw error;
      if (!chat) throw new Error('Failed to create new chat');

      console.log('New chat created successfully:', chat);
      setChats(prev => [chat, ...prev]);
      setCurrentChat(chat);
      setMessages([]);
    } catch (error) {
      console.error('Error creating new chat:', error);
      alert('Failed to create new chat. Please try again.');
    }
  };

  const saveMessage = async (message: Message, chatId: string) => {
    try {
      console.log('Saving message to chat ID:', chatId);
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([{
          chat_id: chatId,
          sender: message.sender,
          content: message.text,
          image_url: message.image
        }])
        .select();

      if (error) throw error;
      console.log('Message saved successfully:', data);

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

    } catch (error) {
      console.error('Error saving message:', error);
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

  const handleSendMessage = async (e?: React.FormEvent, imageFile?: File) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newMessage.trim() && !imageFile && !user) return;

    let chatId: string;
    let isNewChat = false;
    
    // Create a new chat if there isn't one
    if (!currentChat) {
      try {
        console.log('Creating new chat...');
        const { data: chat, error } = await supabase
          .from('chats')
          .insert([{ 
            user_id: user!.id,
            title: newMessage.slice(0, 50) + (newMessage.length > 50 ? '...' : '')
          }])
          .select()
          .single();

        if (error) throw error;
        if (!chat) throw new Error('Failed to create new chat');

        console.log('New chat created:', chat);
        chatId = chat.id;
        isNewChat = true;
        setChats(prev => [chat, ...prev]);
        setCurrentChat(chat);
      } catch (error) {
        console.error('Error creating chat:', error);
        return;
      }
    } else {
      console.log('Using existing chat:', currentChat.id);
      chatId = currentChat.id;
    }

    const messageId = Date.now().toString();
    let imageUrl = '';

    // Handle image upload
    if (imageFile) {
      try {
        console.log('Uploading image...');
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(`chat/${user!.id}/${messageId}`, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(`chat/${user!.id}/${messageId}`);

        imageUrl = publicUrl;
        console.log('Image uploaded:', publicUrl);
      } catch (error: any) {
        console.error('Error uploading image:', error);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: `Error uploading image: ${error.message || 'Something went wrong'}. Please try again.`,
          sender: 'assistant',
          timestamp: new Date()
        }]);
        return;
      }
    }

    // Create and add user message
    const userMessage: Message = {
      id: messageId,
      text: newMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      ...(imageUrl && { image: imageUrl })
    };

    console.log('Adding user message to UI:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    // Save user message to database
    await saveMessage(userMessage, chatId);

    try {
      console.log('Fetching AI response...');
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('userId', user!.id);
        formData.append('message', newMessage || '');
        formData.append('chatId', chatId);
        formData.append('context', JSON.stringify(messages.slice(-5)));

        response = await fetch('/api/chat', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: newMessage, 
            userId: user!.id,
            chatId: chatId,
            context: messages.slice(-5)
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      console.log('Received AI response:', data);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'assistant',
        timestamp: new Date()
      };

      console.log('Adding assistant message to UI:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save assistant message to database using the same chatId
      await saveMessage(assistantMessage, chatId);

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

    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      // Save error message to the same chat
      await saveMessage(errorMessage, chatId);
    } finally {
      setIsLoading(false);
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add image compression utility
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200;

          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            0.8 // compression quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
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

  const handleChatMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setChatMenuAnchorEl(event.currentTarget);
  };

  const handleChatMenuClose = () => {
    setChatMenuAnchorEl(null);
  };

  const handleChatOptionsOpen = (event: React.MouseEvent<HTMLElement>, chatId: string) => {
    event.stopPropagation();
    setSelectedChatForOptions(chatId);
    setChatOptionsAnchorEl(event.currentTarget);
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

  const debugChatState = () => {
    console.log('Current chat state:');
    console.log('Current chat:', currentChat);
    console.log('All chats:', chats);
    console.log('Filtered chats:', filteredChats);
    console.log('Sidebar visible:', showSidebar);
    console.log('Is mobile:', isMobile);
    
    // Force refresh the chat list
    loadChats();
  };

  const saveMeal = async (message: Message) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meals')
        .insert([
          {
            title: message.text.split('\n')[0], // First line as title
            description: message.text,
            type: 'AI_GENERATED',
            user_id: user?.id,
            nutritional_info: {
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0
            },
            ingredients: [],
            instructions: []
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setNotification({ type: 'success', message: t('notifications.mealSaved') });
    } catch (error) {
      console.error('Error saving meal:', error);
      setNotification({ type: 'error', message: t('notifications.errorSavingMeal') });
    } finally {
      setLoading(false);
    }
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
                Ask me anything about cooking, recipes, or ingredients. I can help you plan meals, suggest recipes, and more.
              </Typography>
            </Box>
          )}
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                gap: 1.5,
                alignItems: 'flex-start',
                maxWidth: '100%',
                mb: 2,
                px: isMobile ? 0 : 2,
              }}
            >
              <Avatar
                src={message.sender === 'user' && user?.user_metadata?.avatar_url ? user.user_metadata.avatar_url : undefined}
                sx={{
                  bgcolor: message.sender === 'user' ? 
                    alpha(theme.palette.primary.main, 0.9) : 
                    alpha(theme.palette.secondary.main, 0.9),
                  width: 32,
                  height: 32,
                  display: isTablet ? 'none' : 'flex',
                  flexShrink: 0,
                }}
              >
                {message.sender === 'user' ? <PersonIcon /> : <BotIcon />}
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  maxWidth: isMobile ? '85%' : '70%',
                  bgcolor: message.sender === 'user' ? 
                    alpha(theme.palette.primary.main, 0.08) : 
                    alpha(theme.palette.background.paper, 0.8),
                  color: theme.palette.text.primary,
                  borderRadius: 2,
                  position: 'relative',
                  wordBreak: 'break-word',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(
                    message.sender === 'user' ? 
                      theme.palette.primary.main : 
                      theme.palette.divider,
                    0.1
                  )}`,
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
                        '&:hover': {
                          '& > .image-overlay': {
                            opacity: 1,
                          },
                        },
                      }}
                    >
                      <img 
                        src={message.image} 
                        alt="Uploaded content"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'contain',
                        }}
                      />
                    </Box>
                  )}
                  {message.text && (
                    <Box sx={{ width: '100%' }}>
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </Box>
                  )}
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1,
                  mt: 1
                }}>
                  {message.sender === 'assistant' && (() => {
                    // Simplified meal content detection
                    const extractMealInfo = (text: string) => {
                      // Look for ingredients section with more flexible pattern matching
                      const ingredientsMatch = text.match(/ingredients:?[\s\S]*?(?=instructions:?|$)/i);
                      const instructionsMatch = text.match(/instructions:?[\s\S]*?(?=(?:cooking time|difficulty|$))/i);
                      
                      // Extract ingredients with improved parsing
                      const ingredients = ingredientsMatch ? ingredientsMatch[0]
                        .split('\n')
                        .slice(1) // Skip the "Ingredients:" line
                        .map(line => line.trim())
                        .filter(line => line && !line.toLowerCase().includes('ingredients'))
                        .map(line => {
                          // Try to parse amount, unit, and name with more flexible pattern
                          const match = line.match(/^(?:[-•*]?\s*)?(\d+(?:\/\d+)?(?:\.\d+)?)\s*([a-zA-Z]+)?\s*(.+)$/);
                          if (match) {
                            const amount = match[1].includes('/') ? 
                              eval(match[1].split('/').reduce((a, b) => String(Number(a) / Number(b)))) : 
                              parseFloat(match[1]);
                            return {
                              name: match[3].trim(),
                              amount: isNaN(amount) ? 1 : amount,
                              unit: match[2] || 'piece'
                            };
                          }
                          return {
                            name: line.replace(/^[-•*]\s*/, '').trim(),
                            amount: 1,
                            unit: 'piece'
                          };
                        }) : [];

                      // Extract instructions with improved parsing
                      const instructions = instructionsMatch ? instructionsMatch[0]
                        .split('\n')
                        .slice(1) // Skip the "Instructions:" line
                        .map(line => line.trim())
                        .filter(line => line && !line.toLowerCase().includes('instructions'))
                        .map(line => {
                          const text = line.replace(/^(?:\d+\.\s*|[-•*]\s*)/, '').trim();
                          // Try to find duration in the step
                          const durationMatch = text.match(/(\d+)[\s-]*(minutes?|mins?|hours?)/i);
                          const duration = durationMatch ? 
                            (durationMatch[2].toLowerCase().startsWith('hour') ? 
                              parseInt(durationMatch[1]) * 60 : 
                              parseInt(durationMatch[1])) : 
                            null;

                          return {
                            text,
                            duration: duration || null,
                            timer_required: duration !== null
                          };
                        }) : [];

                      // Try to find a title - look for any prominent text before ingredients
                      const titleMatch = text.match(/\*\*([^*]+)\*\*/) || // Match text between ** **
                                      text.match(/^([^\n]+)(?=\n+ingredients:)/i) || 
                                      text.match(/^(?:\*\*)?([^*\n]+)(?:\*\*)?\s*$/m);
                      const title = titleMatch ? titleMatch[1].trim() : 'New Recipe';

                      // Try to find cooking time and difficulty
                      const timeMatch = text.match(/(?:cooking time|time):\s*(?:approximately\s*)?(\d+)\s*(?:minutes?|mins?)/i);
                      const difficultyMatch = text.match(/difficulty(?:\s*level)?:\s*(easy|medium|hard)/i);

                      // Only show the button if we have both ingredients and instructions
                      if (ingredients.length > 0 && instructions.length > 0) {
                        return {
                          title,
                          ingredients,
                          instructions,
                          cooking_time: timeMatch ? parseInt(timeMatch[1]) : 30,
                          difficulty: (difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium') as 'easy' | 'medium' | 'hard',
                          servings: 4,
                          created_at: new Date().toISOString(),
                          updated_at: new Date().toISOString(),
                          nutritional_info: {
                            calories: 0,
                            protein: 0,
                            carbs: 0,
                            fat: 0,
                            fiber: 0
                          }
                        };
                      }
                      return null;
                    };

                    const mealInfo = extractMealInfo(message.text);
                    
                    // Show button if it looks like a meal description
                    const hasValidContent = mealInfo !== null;

                    return hasValidContent && (
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

                              const { data, error } = await supabase
                                .from('meals')
                                .insert([{
                                  user_id: user?.id,
                                  title: mealInfo.title,
                                  description: message.text,
                                  type: 'dinner',
                                  nutritional_info: mealInfo.nutritional_info,
                                  ingredients: formattedIngredients,
                                  instructions: formattedInstructions,
                                  created_at: mealInfo.created_at,
                                  updated_at: mealInfo.updated_at,
                                  cooking_time: mealInfo.cooking_time,
                                  servings: mealInfo.servings
                                }])
                                .select()
                                .single();

                              if (error) {
                                console.error('Supabase error:', error);
                                throw error;
                              }
                              
                              setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                text: t('notifications.mealSaved'),
                                sender: 'assistant',
                                timestamp: new Date()
                              }]);
                            } catch (error: any) {
                              console.error('Error saving meal:', error);
                              console.error('Error details:', error.message, error.details);
                              setMessages(prev => [...prev, {
                                id: Date.now().toString(),
                                text: `Failed to save meal: ${error.message || 'Unknown error'}`,
                                sender: 'assistant',
                                timestamp: new Date()
                              }]);
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
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              transform: 'translateY(-1px)',
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            },
                            ml: 1,
                            flexShrink: 0,
                            backdropFilter: 'blur(8px)',
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
                    );
                  })()}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: message.sender === 'user' ? 'auto' : 8,
                    left: message.sender === 'user' ? 8 : 'auto',
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
          ))}
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