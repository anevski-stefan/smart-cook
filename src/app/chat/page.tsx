'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
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
} from '@mui/material';
import {
  Send as SendIcon,
  Save as SaveIcon,
  PhotoCamera,
  SmartToy as BotIcon,
  Person as PersonIcon,
  ArrowBack as ArrowBackIcon,
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
}

interface Recipe {
  title: string;
  instructions: { text: string }[];
  ingredients: { name: string; amount: string; unit: string }[];
  readyInMinutes: number;
  difficulty: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

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

  const extractRecipe = (text: string): Recipe | null => {
    try {
      // Look for recipe patterns in the text
      const titleMatch = text.match(/(?:Recipe|How to make):\s*([^\n]+)/i);
      const timeMatch = text.match(/(?:cooking time|ready in|takes):\s*(\d+)\s*(?:minutes|mins)/i);
      const difficultyMatch = text.match(/difficulty:\s*(easy|medium|hard)/i);
      
      if (!titleMatch) return null;

      // Extract ingredients
      const ingredients = text.match(/ingredients:[\s\S]*?(?=instructions|steps|method|directions|$)/i)?.[0]
        ?.split('\n')
        .slice(1)
        .filter(line => line.trim())
        .map(line => {
          const match = line.match(/[-•]?\s*([^:]+?)(?:\s*:\s*(\d*\.?\d*)\s*(\w+))?$/);
          return match ? {
            name: match[1].trim(),
            amount: match[2] || '1',
            unit: match[3] || 'piece'
          } : null;
        })
        .filter((ing): ing is NonNullable<typeof ing> => ing !== null) || [];

      // Extract instructions
      const instructions = text.match(/(?:instructions|steps|method|directions):[\s\S]*?(?=\n\n|$)/i)?.[0]
        ?.split('\n')
        .slice(1)
        .filter(line => line.trim())
        .map(line => ({
          text: line.replace(/^\d+\.\s*/, '').trim()
        })) || [];

      if (ingredients.length === 0 || instructions.length === 0) return null;

      return {
        title: titleMatch[1].trim(),
        ingredients,
        instructions,
        readyInMinutes: parseInt(timeMatch?.[1] || '30'),
        difficulty: (difficultyMatch?.[1] || 'medium').toLowerCase() as 'easy' | 'medium' | 'hard'
      };
    } catch (error) {
      console.error('Error extracting recipe:', error);
      return null;
    }
  };

  const saveRecipe = async (recipe: Recipe) => {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .insert([{
          user_id: user?.id,
          title: recipe.title,
          instructions: recipe.instructions,
          ingredients: recipe.ingredients,
          cooking_time: recipe.readyInMinutes,
          difficulty: recipe.difficulty,
          cuisine: 'Custom',
          servings: 4,
          image: '',
          description: `Custom recipe created from chat: ${recipe.title}`,
          nutritional_info: {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
          }
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      handleSendMessage(undefined, file);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, imageFile?: File) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!newMessage.trim() && !imageFile && !user) return;

    const messageId = Date.now().toString();
    let imageUrl = '';

    // Handle image upload first if there's an image
    if (imageFile) {
      try {
        // Upload directly to the images bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(`chat/${user!.id}/${messageId}`, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(uploadError.message);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(`chat/${user!.id}/${messageId}`);

        imageUrl = publicUrl;
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
    if (newMessage.trim() || imageUrl) {
      const userMessage: Message = {
        id: messageId,
        text: newMessage.trim(),
        sender: 'user',
        timestamp: new Date(),
        ...(imageUrl && { image: imageUrl })
      };
      setMessages(prev => [...prev, userMessage]);
    }
    
    setNewMessage('');
    setIsLoading(true);

    try {
      let response;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('userId', user!.id);
        formData.append('message', newMessage || '');
        // Add context from previous messages
        formData.append('context', JSON.stringify(messages.slice(-5))); // Last 5 messages for context

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
            context: messages.slice(-5) // Last 5 messages for context
          })
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: `Error: ${error.message || 'Something went wrong. Please try again.'}`,
        sender: 'assistant',
        timestamp: new Date()
      }]);
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

  return (
    <Box 
      sx={{ 
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: theme.palette.mode === 'light' ? '#F8FAFC' : '#0A1929',
        '@media (max-width: 600px)': {
          position: 'fixed',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
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
        {isMobile && (
          <IconButton 
            edge="start" 
            onClick={() => router.back()}
            sx={{ 
              mr: 1,
              color: 'text.primary',
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          component="h1"
          sx={{ 
            fontWeight: 600,
            flex: 1,
            color: 'text.primary',
            letterSpacing: '-0.01em',
          }}
        >
          {t('navigation.chat')}
        </Typography>
      </Box>
      
      {/* Messages Area */}
      <Box 
        sx={{ 
          flex: 1,
          overflowY: 'auto',
          px: isMobile ? 2 : 4,
          py: 3,
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
              }}>
                {message.sender === 'assistant' && (
                  <Tooltip title={t('common.save')} placement="top">
                    <IconButton
                      size={isMobile ? "small" : "medium"}
                      onClick={async () => {
                        const recipe = extractRecipe(message.text);
                        if (recipe) {
                          try {
                            await saveRecipe(recipe);
                            setMessages(prev => [...prev, {
                              id: Date.now().toString(),
                              text: 'Recipe saved successfully!',
                              sender: 'assistant',
                              timestamp: new Date()
                            }]);
                          } catch (error) {
                            setMessages(prev => [...prev, {
                              id: Date.now().toString(),
                              text: 'Failed to save recipe. Please try again.',
                              sender: 'assistant',
                              timestamp: new Date()
                            }]);
                          }
                        }
                      }}
                      sx={{
                        opacity: 0.7,
                        '&:hover': { 
                          opacity: 1,
                          bgcolor: alpha(theme.palette.action.hover, 0.8),
                        },
                        ml: 1,
                        flexShrink: 0,
                      }}
                    >
                      <SaveIcon fontSize={isMobile ? "small" : "medium"} />
                    </IconButton>
                  </Tooltip>
                )}
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
        <Tooltip title={t('navigation.scan')} placement="top">
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
          placeholder={t('common.typeMessage')}
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
        <Tooltip title={t('common.send')} placement="top">
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
  );
} 