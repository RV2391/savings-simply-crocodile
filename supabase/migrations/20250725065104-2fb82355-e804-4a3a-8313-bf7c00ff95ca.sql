-- Create a table to log form submissions for GDPR compliance
CREATE TABLE public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  submission_data JSONB NOT NULL,
  consent_data JSONB NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insertions (no user auth required for calculator)
CREATE POLICY "Allow public form submissions" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to prevent public reads (only allow through edge functions)
CREATE POLICY "No public reads on form submissions" 
ON public.form_submissions 
FOR SELECT 
USING (false);