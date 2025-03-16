-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages from their chats" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their chats" ON public.chat_messages;

-- Enable RLS on chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing messages
CREATE POLICY "Users can view messages from their chats"
ON public.chat_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  )
);

-- Create policy for inserting messages
CREATE POLICY "Users can insert messages to their chats"
ON public.chat_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = chat_messages.chat_id
    AND chats.user_id = auth.uid()
  )
); 