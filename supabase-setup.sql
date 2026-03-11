-- Supabase 数据库设置脚本
-- 在 Supabase Dashboard 的 SQL Editor 中执行

-- 创建孕期记录表
CREATE TABLE IF NOT EXISTS records (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  week_number INTEGER NOT NULL,
  day_number INTEGER,
  mom_message TEXT NOT NULL,
  mom_mood TEXT NOT NULL,
  dad_message TEXT,
  has_dad_interaction BOOLEAN DEFAULT FALSE,
  dad_message_time BIGINT,
  kiss_sent BOOLEAN DEFAULT FALSE,
  kiss_time BIGINT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT
);

-- 启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE records;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);

-- 开启RLS（行级安全策略）
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取和写入记录
CREATE POLICY "Allow public access to records" ON records
  FOR ALL
  USING (true)
  WITH CHECK (true);
