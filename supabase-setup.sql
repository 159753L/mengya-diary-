-- Supabase 数据库设置脚本
-- 在 Supabase Dashboard 的 SQL Editor 中执行

-- 创建用户表（用于登录和存储宝宝信息）
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- 手机号作为ID
  baby_name TEXT NOT NULL,
  due_date TEXT NOT NULL,
  password TEXT NOT NULL, -- 登录密码
  created_at BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  updated_at BIGINT
);

-- 启用实时功能
ALTER PUBLICATION supabase_realtime ADD TABLE records;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_records_date ON records(date);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);

-- 开启RLS（行级安全策略）
ALTER TABLE records ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取和写入记录
CREATE POLICY "Allow public access to records" ON records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 允许所有用户读取和写入用户信息
CREATE POLICY "Allow public access to users" ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);
