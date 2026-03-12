// 用户长期记忆服务 - 状态标签 + 时间戳方案
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;
const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;

// 用户ID（可以后续扩展为动态生成）
const USER_ID = 'default_user';

// 症状状态结构
interface SymptomState {
  current_symptoms: string[];     // 当前症状
  resolved_symptoms: string[];  // 已解决症状（含时间戳）
  pregnancy_week?: number;       // 当前孕周
  due_date?: string;            // 预产期
  last_update: string;          // 最后更新时间
  history: {                    // 历史记录（用于数据分析）
    symptom: string;
    start_week?: number;
    end_week?: number;
    status: 'current' | 'resolved' | 'expired';
  }[];
}

// 初始化空状态
function createEmptyState(): SymptomState {
  return {
    current_symptoms: [],
    resolved_symptoms: [],
    last_update: new Date().toISOString().split('T')[0],
    history: []
  };
}

// 解析AI返回的状态更新
function parseStateUpdate(aiResponse: string): Partial<SymptomState> | null {
  try {
    // 尝试提取JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // JSON解析失败，返回null
  }
  return null;
}

// 调用 MiniMax 检测症状状态变化
async function detectSymptomChanges(
  currentState: SymptomState,
  newUserMessage: string,
  previousMessages: { role: string; content: string }[]
): Promise<Partial<SymptomState>> {
  if (!MINIMAX_API_KEY) return {};

  // 构建上下文
  const context = previousMessages.slice(-6).map(m =>
    `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`
  ).join('\n');

  const prompt = `你是一个孕期症状状态侦测器。根据用户最新的消息，检测症状状态变化。

当前状态：
- 当前症状: ${currentState.current_symptoms.join(', ') || '无'}
- 已解决症状: ${currentState.resolved_symptoms.join(', ') || '无'}

最近对话：
${context}
用户最新消息: ${newUserMessage}

请分析用户消息，检测：
1. 是否有新症状出现？（如：孕吐、腰痛、失眠等）
2. 是否有症状消失/好转？（如：不吐了、孕吐好了、腰不酸了等）
3. 是否提到了孕周变化？

请返回JSON格式的状态更新（只返回变化的字段，不要返回其他内容）：
{
  "added_symptoms": ["新症状1"],      // 用户新提到的症状
  "resolved_symptoms": ["症状1"],     // 用户说已经好转/消失的症状
  "pregnancy_week": 12,              // 如果用户提到孕周变化
  "note": "简短说明"                   // 可选备注
}

如果用户只是普通聊天，没有提到症状变化，返回：
{"note": "无变化"}

只返回JSON，不要其他文字。`;

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) return {};

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || '';

    // 解析结果
    const match = result.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
  } catch (error) {
    console.error('[Memory] 状态检测失败:', error);
  }

  return {};
}

// 更新症状状态
function updateSymptomState(
  currentState: SymptomState,
  changes: {
    added_symptoms?: string[];
    resolved_symptoms?: string[];
    pregnancy_week?: number;
    due_date?: string;
  }
): SymptomState {
  const newState = { ...currentState };
  const now = new Date().toISOString().split('T')[0];

  // 添加新症状
  if (changes.added_symptoms) {
    for (const symptom of changes.added_symptoms) {
      if (!newState.current_symptoms.includes(symptom)) {
        newState.current_symptoms.push(symptom);
        // 记录到历史
        newState.history.push({
          symptom,
          start_week: changes.pregnancy_week,
          status: 'current'
        });
      }
    }
  }

  // 标记已解决症状
  if (changes.resolved_symptoms) {
    for (const symptom of changes.resolved_symptoms) {
      const idx = newState.current_symptoms.indexOf(symptom);
      if (idx > -1) {
        newState.current_symptoms.splice(idx, 1);
        newState.resolved_symptoms.push(symptom);
        // 更新历史记录
        const historyItem = newState.history.find(h => h.symptom === symptom && h.status === 'current');
        if (historyItem) {
          historyItem.status = 'resolved';
          historyItem.end_week = changes.pregnancy_week;
        }
      }
    }
  }

  // 更新孕周
  if (changes.pregnancy_week) {
    newState.pregnancy_week = changes.pregnancy_week;
  }

  // 更新预产期
  if (changes.due_date) {
    newState.due_date = changes.due_date;
  }

  newState.last_update = now;

  // 时效控制：4周前的已解决症状标记为过期
  // （这里简化处理，实际需要根据孕周计算）
  if (newState.resolved_symptoms.length > 10) {
    newState.resolved_symptoms = newState.resolved_symptoms.slice(-10);
  }

  return newState;
}

// 保存用户状态到 Supabase
export async function saveState(state: SymptomState): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // 检查是否已有记忆
    const { data: existing } = await supabase
      .from('memory')
      .select('id')
      .eq('user_id', USER_ID)
      .limit(1);

    const now = Date.now();
    const stateJson = JSON.stringify(state);

    if (existing && existing.length > 0) {
      // 更新
      await supabase
        .from('memory')
        .update({ content: stateJson, updated_at: now })
        .eq('user_id', USER_ID);
    } else {
      // 插入
      await supabase
        .from('memory')
        .insert([{
          id: `memory_${USER_ID}`,
          user_id: USER_ID,
          content: stateJson,
          created_at: now,
          updated_at: now
        }]);
    }

    console.log('[Memory] 状态已保存:', state);
    return true;
  } catch (error) {
    console.error('[Memory] 保存失败:', error);
    return false;
  }
}

// 获取用户状态
export async function getState(): Promise<SymptomState> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return createEmptyState();

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const { data } = await supabase
      .from('memory')
      .select('content')
      .eq('user_id', USER_ID)
      .limit(1);

    if (data?.[0]?.content) {
      // 兼容旧格式：如果是JSON格式则解析，否则返回空状态
      try {
        return JSON.parse(data[0].content);
      } catch (e) {
        // 旧格式是纯文本，需要覆盖为新JSON格式
        console.log('[Memory] 检测到旧格式记忆，将转换为新格式');
        return createEmptyState();
      }
    }
  } catch (error) {
    console.error('[Memory] 获取失败:', error);
  }

  return createEmptyState();
}

// 处理对话并实时更新状态（每一轮都调用）
export async function processMemory(
  userMessage: string,
  previousMessages: { role: string; content: string }[],
  pregnancyWeek?: number,
  dueDate?: string
): Promise<{ state: SymptomState; changes: boolean }> {
  console.log('[Memory] processMemory 被调用, 消息:', userMessage);

  // 获取当前状态
  const currentState = await getState();
  console.log('[Memory] 当前状态:', currentState);

  // 如果传入了孕周/预产期，更新到状态中
  if (pregnancyWeek || dueDate) {
    currentState.pregnancy_week = pregnancyWeek || currentState.pregnancy_week;
    currentState.due_date = dueDate || currentState.due_date;
  }

  // 检测症状变化
  const changes = await detectSymptomChanges(currentState, userMessage, previousMessages);

  // 检查是否有实际变化
  const hasChanges = (changes.added_symptoms && changes.added_symptoms.length > 0) ||
                     (changes.resolved_symptoms && changes.resolved_symptoms.length > 0) ||
                     !!changes.pregnancy_week;

  if (hasChanges) {
    console.log('[Memory] 检测到状态变化:', changes);

    // 更新状态
    const newState = updateSymptomState(currentState, {
      added_symptoms: changes.added_symptoms,
      resolved_symptoms: changes.resolved_symptoms,
      pregnancy_week: changes.pregnancy_week || pregnancyWeek,
      due_date: dueDate
    });

    // 保存新状态
    await saveState(newState);

    return { state: newState, changes: true };
  }

  return { state: currentState, changes: false };
}

// 兼容旧接口 - 获取记忆文本用于AI提示词
export async function getMemory(): Promise<string> {
  const state = await getState();

  // 转换为AI可读的提示词
  const parts: string[] = [];

  if (state.current_symptoms.length > 0) {
    parts.push(`当前症状: ${state.current_symptoms.join(', ')}`);
  }

  if (state.resolved_symptoms.length > 0) {
    parts.push(`已好转: ${state.resolved_symptoms.join(', ')}`);
  }

  if (state.pregnancy_week) {
    parts.push(`孕${state.pregnancy_week}周`);
  }

  if (state.due_date) {
    parts.push(`预产期: ${state.due_date}`);
  }

  return parts.length > 0 ? parts.join(' | ') : '';
}

// 获取完整状态（用于数据分析）
export async function getFullState(): Promise<SymptomState> {
  return getState();
}

// 旧接口保留（用于降级）
export async function saveMemory(content: string): Promise<boolean> {
  const state = createEmptyState();
  state.current_symptoms = [content];
  return saveState(state);
}

// 旧接口保留
export async function processMemoryLegacy(messages: { role: string; content: string }[]): Promise<string> {
  return '';
}
