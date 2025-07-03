
-- Add call_initiated column to contacts table
ALTER TABLE public.contacts 
ADD COLUMN call_initiated boolean NOT NULL DEFAULT false;

-- Add comment to document the column purpose
COMMENT ON COLUMN public.contacts.call_initiated IS 'Tracks whether a call has been initiated for this contact';
