-- Create messages table for admin-to-customer communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Admins can manage all messages
CREATE POLICY "Admins can manage messages"
ON public.messages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own messages
CREATE POLICY "Users can view their messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_order_id ON public.messages(order_id);