// AI 服务 - RAG（检索增强生成）实现
// 方案1: 先检索知识库，再让AI参考知识库回答

import { searchAnswer, KNOWLEDGE_BASE } from '../data/knowledge';
import { processMemory, getMemory, getState } from './memoryService';

const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

// 判断是否配置了AI
export const isAIConfigured = () => !!MINIMAX_API_KEY;

// 从 ragService 导入 RAG 配置检查
import { isRAGConfigured } from './ragService';
export { isRAGConfigured };

// 使用本地知识库回答（不带AI）
export function getLocalAnswer(query: string): string {
  const result = searchAnswer(query);
  if (result) {
    return result.answer;
  }
  return null;
}

// 检索知识库 - 返回相关条目
export function retrieveKnowledge(query: string): { question: string; answer: string }[] {
  const lowerQuery = query.toLowerCase();
  const results: { question: string; answer: string; score: number }[] = [];

  for (const item of KNOWLEDGE_BASE) {
    let score = 0;

    // 检查关键词匹配
    for (const keyword of item.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // 检查问题匹配
    if (item.question.toLowerCase().includes(lowerQuery)) {
      score += 5;
    }

    // 检查答案包含
    if (item.answer.toLowerCase().includes(lowerQuery)) {
      score += 2;
    }

    if (score > 0) {
      results.push({ question: item.question, answer: item.answer, score });
    }
  }

  // 返回得分最高的3条
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => ({ question: r.question, answer: r.answer }));
}

// 调用 MiniMax AI 回答问题（RAG模式）
export async function getMiniMaxAnswer(query: string, history?: { role: string; content: string }[]): Promise<string> {
  // 如果没有配置AI Key，使用本地知识库
  if (!MINIMAX_API_KEY) {
    const localAnswer = getLocalAnswer(query);
    return localAnswer || '抱歉，我的知识库中没有这个问题的答案。建议咨询医生获取专业指导。';
  }

  // 从 Supabase 检索知识库（云端）
  const { vectorSearch } = await import('./ragService');
  const relevantKnowledge = await vectorSearch(query, 3);
  console.log('[AI] 从Supabase检索到:', relevantKnowledge.length, '条相关知识');

  // 获取用户长期记忆
  const memory = await getMemory();
  console.log('[AI] 用户记忆:', memory ? '有' : '无');

  // 获取用户孕周信息
  let pregnancyInfo = '';
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      if (userInfo.dueDate) {
        // 计算当前孕周
        const today = new Date();
        const dueDate = new Date(userInfo.dueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const currentWeek = 40 - Math.floor(diffDays / 7);

        let phase = '';
        if (currentWeek <= 12) phase = '孕早期';
        else if (currentWeek <= 27) phase = '孕中期';
        else phase = '孕晚期';

        pregnancyInfo = `\n## 用户当前状态：\n- 当前孕周：第${currentWeek}周（第${currentWeek * 7}天）\n- 孕期阶段：${phase}\n- 距离预产期：约${diffDays}天\n`;
        console.log('[AI] 孕周信息:', pregnancyInfo);
      }
    }
  } catch (e) {
    console.log('[AI] 获取孕周信息失败');
  }

  // 构建提示词
  let systemPrompt = `你是一位专业、温暖、有爱心的孕期助手。

【最关键的规则】
用户现在正处于孕期第${(function(){
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if(userInfoStr){
      const userInfo = JSON.parse(userInfoStr);
      const today = new Date();
      const dueDate = new Date(userInfo.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return 40 - Math.floor(diffDays / 7);
    }
  }catch(e){}
  return 'X';
})()}周（孕${(function(){
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if(userInfoStr){
      const userInfo = JSON.parse(userInfoStr);
      const today = new Date();
      const dueDate = new Date(userInfo.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const w = 40 - Math.floor(diffDays / 7);
      return w <= 12 ? '早' : w <= 27 ? '中' : '晚';
    }
  }catch(e){}
  return 'X';
})()}期）！

回答要求：
1. 回答时必须首先考虑用户当前是第几周，针对该孕周给出具体建议
2. 必须是"孕X周应该这样做"，而不是泛泛而谈"怀孕早期/中期/晚期"
3. 严格参考知识库中的答案
4. 如果知识库中包含【重要安全提示】或【紧急情况】，必须原样引用并强调
5. 对于出血、见红、破水、剧烈腹痛等危险症状，必须提醒"请立即就医"
6. 语气温柔，带适当的 emoji
7. 简洁明了，控制在200字以内
8. 如果知识库没有相关信息，诚实的说"我需要再学习一下"并建议咨询医生

`;

  // 加入用户孕周信息
  if (pregnancyInfo) {
    systemPrompt += pregnancyInfo;
  }

  // 如果有用户记忆，加入到提示词中
  if (memory) {
    systemPrompt += `\n## 用户历史记忆：\n${memory}\n`;
  }

  let userPrompt = query;

  // 如果找到了相关知识，加入参考
  if (relevantKnowledge.length > 0) {
    systemPrompt += `\n## 参考知识：\n`;
    relevantKnowledge.forEach((item, index) => {
      systemPrompt += `\n【参考${index + 1}】\n问题：${item.question}\n答案：${item.answer}\n`;
    });
    userPrompt += `\n\n请根据以上参考知识回答。`;
  } else {
    // 如果 Supabase 没找到，用本地知识库
    const localKnowledge = retrieveKnowledge(query);
    if (localKnowledge.length > 0) {
      systemPrompt += `\n## 参考知识（本地）：\n`;
      localKnowledge.forEach((item, index) => {
        systemPrompt += `\n【参考${index + 1}】\n问题：${item.question}\n答案：${item.answer}\n`;
      });
      userPrompt += `\n\n请根据以上参考知识回答。`;
    }
  }

  try {
    // 构建消息列表，包含历史对话和当前问题
    const messages: { role: string; content: string }[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // 添加对话历史
    if (history && history.length > 0) {
      messages.push(...history);
    }

    // 添加当前问题
    messages.push({
      role: 'user',
      content: userPrompt
    });

    const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: messages
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      const answer = data.choices[0].message.content;

      // 回答成功后，默默检测并更新用户状态（症状跟踪）
      // 从localStorage获取用户孕周信息
      try {
        const dueDate = localStorage.getItem('dueDate');
        const weekInfo = localStorage.getItem('weekInfo');
        let pregnancyWeek: number | undefined;

        if (weekInfo) {
          const parsed = JSON.parse(weekInfo);
          pregnancyWeek = parsed.currentWeek;
        }

        console.log('[AI] 开始状态检测, 孕周:', pregnancyWeek, '预产期:', dueDate);

        // 实时检测状态变化（每一轮都检测）
        await processMemory(query, history || [], pregnancyWeek, dueDate || undefined);
      } catch (e) {
        console.error('[AI] 状态检测失败:', e);
        // 静默失败，不影响用户回答
      }

      return answer;
    }

    return '抱歉，我暂时无法回答这个问题。';
  } catch (error) {
    console.error('MiniMax API error:', error);
    // 降级到本地知识库
    const localAnswer = getLocalAnswer(query);
    return localAnswer || '抱歉，我现在有点累，让我休息一下。你可以尝试换个问题，或者咨询医生获取专业帮助。';
  }
}

// 统一的回答接口
export async function getAnswer(query: string, history?: { role: string; content: string }[]): Promise<string> {
  // 优先使用RAG模式（AI+知识库）
  if (isAIConfigured()) {
    return getMiniMaxAnswer(query, history);
  }
  // 否则使用纯本地知识库
  const answer = getLocalAnswer(query);
  return answer || '抱歉，我的知识库中没有这个问题的答案。建议咨询医生获取专业指导。';
}
