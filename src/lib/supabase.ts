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

// 获取当前用户ID
function getCurrentUserId(): string {
  return localStorage.getItem('userId') || 'anonymous';
}

// 保存记录到 Supabase（带用户ID）
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
    const userId = getCurrentUserId();
    const recordWithUser = { ...record, user_id: userId };

    const { error } = await supabase
      .from('records')
      .upsert([recordWithUser], { onConflict: 'id' });

    if (error) throw error;
    console.log('📤 记录已同步到云端');
    return { success: true };
  } catch (error) {
    console.error('保存到Supabase失败:', error);
    return { success: false, error: String(error) };
  }
}

// 从 Supabase 加载当前用户的记录
export async function loadRecordsFromSupabase(): Promise<any[]> {
  if (!supabase) {
    return [];
  }

  try {
    const userId = getCurrentUserId();
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    console.log('📥 从云端加载记录:', data?.length || 0, '条');
    return data || [];
  } catch (error) {
    console.error('加载记录失败:', error);
    return [];
  }
}

// 保存用户信息到 Supabase（包含密码）
export async function saveUserInfoToSupabase(userInfo: {
  babyName: string;
  dueDate: string;
  password?: string;
}): Promise<{ success: boolean }> {
  if (!supabase) {
    return { success: false };
  }

  try {
    const userId = getCurrentUserId();
    const { error } = await supabase
      .from('users')
      .upsert([{
        id: userId,
        baby_name: userInfo.babyName,
        due_date: userInfo.dueDate,
        password: userInfo.password,
        updated_at: Date.now()
      }], { onConflict: 'id' });

    if (error) throw error;
    console.log('📤 用户信息已保存到云端');
    return { success: true };
  } catch (error) {
    console.error('保存用户信息失败:', error);
    return { success: false };
  }
}

// 从 Supabase 获取用户信息（包含密码验证）
export async function getUserInfoFromSupabase(phone: string, password: string): Promise<{
  success: boolean;
  userInfo?: { babyName: string; dueDate: string };
}> {
  if (!supabase) {
    return { success: false };
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('baby_name, due_date, password')
      .eq('id', phone)
      .single();

    if (error) {
      // 用户不存在
      if (error.code === 'PGRST116') {
        return { success: false };
      }
      throw error;
    }

    // 验证密码
    if (data.password !== password) {
      return { success: false };
    }

    return {
      success: true,
      userInfo: {
        babyName: data.baby_name,
        dueDate: data.due_date
      }
    };
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return { success: false };
  }
}

// 检查手机号是否已注册
export async function checkPhoneExists(phone: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', phone)
      .single();

    if (error) {
      return false;
    }
    return !!data;
  } catch {
    return false;
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

  const userId = getCurrentUserId();

  const channel = supabase
    .channel('records-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'records',
        filter: `user_id=eq.${userId}`
      },
      async () => {
        const records = await loadRecordsFromSupabase();
        callback(records);
      }
    )
    .subscribe();

  // 初始加载
  loadRecordsFromSupabase().then(callback);

  return () => {
    supabase?.removeChannel(channel);
  };
}

// 保存爸爸留言
export async function sendDadMessage(
  recordId: string,
  message: string
): Promise<{ success: boolean }> {
  if (!supabase) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('records')
      .update({
        dad_message: message,
        has_dad_interaction: true,
        dad_message_time: Date.now()
      })
      .eq('id', recordId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('保存爸爸留言失败:', error);
    return { success: false };
  }
}

// 发送飞吻
export async function sendKiss(recordId: string): Promise<{ success: boolean }> {
  if (!supabase) {
    return { success: false };
  }

  try {
    const { error } = await supabase
      .from('records')
      .update({
        kiss_sent: true,
        kiss_time: Date.now()
      })
      .eq('id', recordId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('发送飞吻失败:', error);
    return { success: false };
  }
}
