import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 使用环境变量（Vite会自动从 .env 文件加载）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 初始化 Supabase（仅在配置了有效密钥时）
let supabase: SupabaseClient | null = null;

export function initSupabase() {
  if (!supabase && supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('✅ Supabase 已连接');
  }
  return supabase;
}

// 检查 Supabase 是否可用
export function isSupabaseReady(): boolean {
  return supabase !== null;
}

// 保存记录到 Supabase
export async function saveRecordToSupabase(record: {
  id: string;
  date: string;
  weekNumber: number;
  momMessage: string;
  momMood: string;
  dadMessage?: string;
  hasDadInteraction: boolean;
  createdAt: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { error } = await supabase
      .from('records')
      .upsert([record], { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('保存到Supabase失败:', error);
    return { success: false, error: String(error) };
  }
}

// 监听记录变化（实时同步）
export function subscribeToRecords(
  callback: (records: unknown[]) => void
): () => void {
  if (!supabase) {
    callback([]);
    return () => {};
  }

  const channel = supabase
    .channel('records-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'records',
      },
      (_payload) => {
        fetchRecords(callback);
      }
    )
    .subscribe();

  fetchRecords(callback);

  return () => {
    supabase?.removeChannel(channel);
  };
}

async function fetchRecords(callback: (records: unknown[]) => void) {
  if (!supabase) {
    callback([]);
    return;
  }

  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(100);

    if (error) throw error;
    callback(data || []);
  } catch (error) {
    console.error('获取记录失败:', error);
    callback([]);
  }
}

// 爸爸发送留言
export async function sendDadMessage(
  recordId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { error } = await supabase
      .from('records')
      .update({
        dadMessage: message,
        hasDadInteraction: true,
        dadMessageTime: Date.now(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('发送爸爸留言失败:', error);
    return { success: false, error: String(error) };
  }
}

// 发送飞吻
export async function sendKiss(recordId: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase not initialized' };
  }

  try {
    const { error } = await supabase
      .from('records')
      .update({
        kissSent: true,
        kissTime: Date.now(),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', recordId);

    if (error) throw error;

    if (navigator.vibrate) {
      navigator.vibrate(200);
    }

    return { success: true };
  } catch (error) {
    console.error('发送飞吻失败:', error);
    return { success: false, error: String(error) };
  }
}

// 初始化
initSupabase();
