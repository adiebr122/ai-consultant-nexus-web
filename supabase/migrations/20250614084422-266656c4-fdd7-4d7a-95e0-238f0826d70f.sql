
-- Add unique constraint for site_settings table to support upsert operations
ALTER TABLE site_settings 
ADD CONSTRAINT site_settings_key_user_id_unique 
UNIQUE (key, user_id);
