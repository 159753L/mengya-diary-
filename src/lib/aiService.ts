// AI 服务 - RAG（检索增强生成）实现
// 方案1: 先检索知识库，再让AI参考知识库回答

import { searchAnswer, KNOWLEDGE_BASE } from '../data/knowledge';

const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;
const MINIMAX_BASE_URL = 'https://api.minimax.chat/v1';

// 判断是否配置了AI
export const isAIConfigured = () => !!MINIMAX_API_KEY;

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
export async function getMiniMaxAnswer(query: string): Promise<string> {
  // 如果没有配置AI Key，使用本地知识库
  if (!MINIMAX_API_KEY) {
    const localAnswer = getLocalAnswer(query);
    return localAnswer || '抱歉，我的知识库中没有这个问题的答案。建议咨询医生获取专业指导。';
  }

  // 检索知识库
  const relevantKnowledge = retrieveKnowledge(query);

  // 构建提示词
  let systemPrompt = `你是一位专业、温暖、有爱心的孕期助手。请根据"参考知识"来回答用户的问题。如果参考知识中有相关信息，请优先使用参考知识回答；如果没有，再根据你的知识回答。

回答要求：
1. 简洁明了，控制在200字以内
2. 语气温柔，带适当的 emoji
3. 如果参考知识和你的知识有冲突，以参考知识为准
4. 如果不确定，建议咨询医生

`;

  let userPrompt = query;

  // 如果找到了相关知识，加入参考
  if (relevantKnowledge.length > 0) {
    systemPrompt += `\n## 参考知识：\n`;
    relevantKnowledge.forEach((item, index) => {
      systemPrompt += `\n【参考${index + 1}】\n问题：${item.question}\n答案：${item.answer}\n`;
    });
    userPrompt += `\n\n请根据以上参考知识回答。`;
  }

  try {
    const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
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
export async function getAnswer(query: string): Promise<string> {
  // 优先使用RAG模式（AI+知识库）
  if (isAIConfigured()) {
    return getMiniMaxAnswer(query);
  }
  // 否则使用纯本地知识库
  const answer = getLocalAnswer(query);
  return answer || '抱歉，我的知识库中没有这个问题的答案。建议咨询医生获取专业指导。';
}

// 导出检索函数，供调试使用
export { retrieveKnowledge };
