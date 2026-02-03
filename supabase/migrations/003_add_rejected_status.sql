-- Add 'rejected' to case_status enum
ALTER TYPE case_status ADD VALUE IF NOT EXISTS 'rejected';
