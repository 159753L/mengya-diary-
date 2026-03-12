// RAG 服务 - 使用 Supabase pgvector + MiniMax Embedding
// 全链路国内服务，不需要 VPN

import { KNOWLEDGE_BASE } from '../data/knowledge';

// 使用 supabase.ts 中已初始化的客户端
import { initSupabase } from './supabase';

interface KnowledgeItem {
  keywords: string[];
  question: string;
  answer: string;
  category: string;
}

const MINIMAX_API_KEY = import.meta.env.VITE_MINIMAX_API_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

// 判断是否配置了RAG
export const isRAGConfigured = () => !!MINIMAX_API_KEY && !!SUPABASE_URL && !!SUPABASE_SERVICE_KEY;

// 使用 MiniMax 生成向量
async function getEmbedding(text: string): Promise<number[]> {
  if (!MINIMAX_API_KEY) return [];

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'embo-01',
        input: text
      })
    });

    if (!response.ok) return [];

    const data = await response.json();
    return data.data?.[0]?.embedding || [];
  } catch (error) {
    console.error('MiniMax embedding error:', error);
    return [];
  }
}

// 初始化向量数据库（把知识库内容存入Supabase）
export async function initVectorStore(): Promise<boolean> {
  console.log('[RAG] initVectorStore 开始执行...');

  if (!isRAGConfigured()) {
    console.log('[RAG] 未配置');
    return false;
  }

  try {
    // 使用 service_role key 创建客户端（绕过 RLS）
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    console.log('[RAG] 使用 service_role key 创建客户端');

    // 检查是否已有数据
    const { data: existing } = await supabase
      .from('knowledge')
      .select('id')
      .limit(1);

    if (existing && existing.length > 0) {
      console.log('[RAG] 知识库已初始化');
      return true;
    }

    // 批量插入知识库
    const items = KNOWLEDGE_BASE.map((item, index) => ({
      id: `knowledge-${index}`,
      question: item.question,
      answer: item.answer,
      category: item.category
    }));

    const { error } = await supabase
      .from('knowledge')
      .upsert(items, { onConflict: 'id' });

    if (error) {
      console.error('[RAG] 插入失败:', error);
      return false;
    }

    console.log(`✅ 知识库初始化完成 (${items.length}条)`);
    return true;
  } catch (error) {
    console.error('[RAG] 初始化失败:', error);
    return false;
  }
}

// 向量检索（优先使用 Supabase，失败则用本地）
export async function vectorSearch(query: string, topK: number = 3): Promise<KnowledgeItem[]> {
  // 先尝试用本地知识库（更可靠）
  const localResult = retrieveKnowledgeLocal(query);
  if (localResult.length > 0) {
    console.log('[RAG] 使用本地知识库，找到:', localResult.length, '条');
    return localResult;
  }

  // 如果本地没有，尝试 Supabase
  if (!isRAGConfigured()) return [];

  try {
    // 直接使用 fetch 调用 REST API
    const fuzzyUrl = `${SUPABASE_URL}/rest/v1/knowledge?question=like.*${encodeURIComponent(query)}*&limit=${topK}`;
    const response = await fetch(fuzzyUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY!,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.log('[RAG] Supabase 搜索失败，状态:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('[RAG] Supabase 搜索结果:', data?.length);

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      keywords: [],
      question: item.question,
      answer: item.answer,
      category: item.category
    }));
  } catch (error) {
    console.error('[RAG] 检索失败:', error);
    return [];
  }
}

// 本地知识库搜索
function retrieveKnowledgeLocal(query: string): KnowledgeItem[] {
  // 提取核心关键词
  const keywords = extractKeywords(query);
  console.log('[RAG] 提取的关键词:', keywords);

  const results: KnowledgeItem[] = [];

  for (const item of KNOWLEDGE_BASE) {
    // 检查关键词是否匹配
    const match = keywords.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return (
        item.question.toLowerCase().includes(lowerKeyword) ||
        item.answer.toLowerCase().includes(lowerKeyword) ||
        item.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
      );
    });

    if (match) {
      results.push(item);
    }
    if (results.length >= 3) break;
  }

  return results;
}

// 从用户问题中提取核心关键词
function extractKeywords(query: string): string[] {
  // 移除常见虚词
  const stopWords = ['怎么办', '怎么', '如何', '怎么样', '为什么', '是不是', '能不能', '可以', '应该', '好吗', '呢', '啊', '呀', '吗', '的', '了', '是', '我', '你', '他', '她', '它', '这', '那'];

  let cleaned = query;
  for (const word of stopWords) {
    cleaned = cleaned.replace(new RegExp(word, 'g'), ' ');
  }

  // 分词并过滤
  const words = cleaned.split(/\s+/).filter(w => w.length >= 2);

  // 如果提取不到关键词，返回原查询
  return words.length > 0 ? words : [query];
}

// RAG 增强回答
export async function getRAGAnswer(query: string): Promise<string> {
  const relevantKnowledge = await vectorSearch(query, 3);

  if (relevantKnowledge.length === 0) {
    return '';
  }

  const context = relevantKnowledge
    .map((item, i) => `【参考${i + 1}】\n问题：${item.question}\n答案：${item.answer}`)
    .join('\n\n');

  return context;
}
