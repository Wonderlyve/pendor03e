/*
  # Add channel messages table

  1. New Tables
    - `channels`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      
    - `channel_messages`
      - `id` (uuid, primary key)
      - `channel_id` (uuid, references channels)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Public can read channels
      - Public can read channel messages
      - Authenticated users can create messages
*/

-- Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create channel_messages table
CREATE TABLE IF NOT EXISTS channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;

-- Channels policies
CREATE POLICY "Channels are viewable by everyone"
  ON channels FOR SELECT
  USING (true);

-- Channel messages policies
CREATE POLICY "Channel messages are viewable by everyone"
  ON channel_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create messages"
  ON channel_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Insert some initial channels with proper UUIDs
INSERT INTO channels (id, name, description) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Expert Pronos', 'Analyses détaillées et pronostics de football'),
  ('22222222-2222-2222-2222-222222222222', 'Top Tipster', 'Spécialiste des paris sportifs'),
  ('33333333-3333-3333-3333-333333333333', 'Football Tips', 'Les meilleurs pronostics football');