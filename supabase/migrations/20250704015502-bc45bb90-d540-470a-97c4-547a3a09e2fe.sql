
-- Create app_settings table for storing various app configurations
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  setting_category TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_category, setting_key)
);

-- Create website_content table for CMS functionality
CREATE TABLE public.website_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  section TEXT NOT NULL,
  title TEXT,
  content TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quotations table for quotation management
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  quotation_number TEXT NOT NULL,
  quotation_date DATE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_company TEXT,
  client_phone TEXT,
  client_address TEXT,
  items JSONB DEFAULT '[]',
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  terms TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quotation_number)
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_settings
CREATE POLICY "Users can view their own settings" ON public.app_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings" ON public.app_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.app_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON public.app_settings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for website_content
CREATE POLICY "Users can view their own content" ON public.website_content
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content" ON public.website_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content" ON public.website_content
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content" ON public.website_content
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for quotations
CREATE POLICY "Users can view their own quotations" ON public.quotations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quotations" ON public.quotations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quotations" ON public.quotations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quotations" ON public.quotations
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('brand-assets', 'brand-assets', true);

INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true);

-- Storage policies for brand-assets bucket
CREATE POLICY "Anyone can view brand assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

CREATE POLICY "Authenticated users can upload brand assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'brand-assets' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own brand assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'brand-assets' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own brand assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'brand-assets' AND 
    auth.role() = 'authenticated'
  );

-- Storage policies for portfolio-images bucket
CREATE POLICY "Anyone can view portfolio images" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can upload portfolio images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own portfolio images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio-images' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their own portfolio images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio-images' AND 
    auth.role() = 'authenticated'
  );
