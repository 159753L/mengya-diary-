import { useState, useRef, useEffect } from 'react';
import { getAnswer, isAIConfigured, isRAGConfigured } from '../lib/aiService';

// 对话消息类型
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// 从localStorage加载历史记录
const loadMessages = (): Message[] => {
  try {
    const saved = localStorage.getItem('ai_chat_history');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return [];
};

// 保存历史记录到localStorage
const saveMessages = (messages: Message[]) => {
  try {
    localStorage.setItem('ai_chat_history', JSON.stringify(messages));
  } catch (e) {}
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // 对话历史 - 从localStorage加载
  const [messages, setMessages] = useState<Message[]>(loadMessages);

  // 保存到localStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // 初始坐标
  const [pos, setPos] = useState({
    x: window.innerWidth / 2 + 100,
    y: window.innerHeight - 250
  });
  const dragging = useRef(false);
  const startOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    hasMoved.current = false;
    startOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      // 记录是否移动过
      const dx = Math.abs(ev.clientX - startOffset.current.x - pos.x);
      const dy = Math.abs(ev.clientY - startOffset.current.y - pos.y);
      if (dx > 3 || dy > 3) {
        hasMoved.current = true;
      }
      setPos({
        x: ev.clientX - startOffset.current.x,
        y: ev.clientY - startOffset.current.y
      });
    };

    const onMouseUp = () => {
      dragging.current = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      // 如果没有移动过，则打开面板
      if (!hasMoved.current) {
        setIsOpen(true);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleAsk = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);

    // 保存用户问题到历史
    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);

    // 将历史消息转换为 AI API 格式
    const historyForAI = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const result = await getAnswer(query, historyForAI);
      // 保存AI回答到历史
      const finalMessages = [...newMessages, { role: 'assistant', content: result }];
      setMessages(finalMessages);
      setAnswer(result);
      // 注意：状态更新已在 aiService 中自动处理（实时症状跟踪）
    } catch (error) {
      const errorMsg = '抱歉，我现在有点累，让我休息一下...';
      setMessages([...newMessages, { role: 'assistant', content: errorMsg }]);
      setAnswer(errorMsg);
    }
    setQuery('');
    setLoading(false);
  };

  return (
    <>
      {/* 悬浮球 */}
      <div
        onMouseDown={onMouseDown}
        style={{
          position: 'fixed',
          left: pos.x + 'px',
          top: pos.y + 'px',
          width: '60px',
          height: '60px',
          background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '30px',
          cursor: 'move',
          zIndex: 2147483647,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          userSelect: 'none',
          touchAction: 'none'
        }}
      >
        🤖
      </div>

      {/* 面板 */}
      {isOpen && (
        <div
          style={{
            position: isExpanded ? 'fixed' : 'fixed',
            left: isExpanded ? '50%' : (pos.x - 310) + 'px',
            top: isExpanded ? '50%' : pos.y + 'px',
            transform: isExpanded ? 'translate(-50%, -50%)' : 'none',
            zIndex: 2147483646,
            width: isExpanded ? '90%' : '300px',
            maxWidth: isExpanded ? '500px' : '300px',
            height: isExpanded ? '70vh' : 'auto',
            maxHeight: isExpanded ? '70vh' : '400px',
            background: 'white',
            borderRadius: isExpanded ? '20px' : '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 头部 */}
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <span style={{ fontWeight: 'bold' }}>孕期小助手</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* 扩大/缩小按钮 */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer' }}
                title={isExpanded ? '缩小' : '扩大'}
              >
                {isExpanded ? '🔽' : '🔼'}
              </button>
              {messages.length > 0 && (
                <button
                  onClick={() => { if (confirm('确定清除对话历史吗？')) { setMessages([]); saveMessages([]); } }}
                  style={{ background: 'none', border: 'none', color: 'white', fontSize: '12px', cursor: 'pointer', opacity: 0.8 }}
                  title="清除历史"
                >
                  🗑️
                </button>
              )}
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>
          </div>

          {/* 对话内容 */}
          <div style={{
            padding: '16px',
            flex: 1,
            overflowY: 'auto',
            minHeight: isExpanded ? '300px' : 'auto'
          }}>
            {/* 显示对话历史 */}
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                {msg.role === 'user' ? (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', background: '#a78bfa', color: 'white', padding: '8px 12px', borderRadius: '12px 12px 0 12px', fontSize: '13px', maxWidth: '80%' }}>
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div>
                    <span style={{ display: 'inline-block', background: '#f3f4f6', color: '#333', padding: '8px 12px', borderRadius: '12px 12px 12px 0', fontSize: '13px', maxWidth: '90%' }}>
                      {msg.content}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <p style={{ fontSize: '14px', color: '#999', textAlign: 'center' }}>🤔 思考中...</p>
            )}

            {!loading && messages.length === 0 && (
              <div>
                <p style={{ fontSize: '14px', color: '#999', textAlign: 'center' }}>有什么孕期问题可以问我哦～</p>
                {isRAGConfigured() ? (
                  <p style={{ fontSize: '12px', color: '#8b5cf6', textAlign: 'center', marginTop: '8px' }}>🧠 向量RAG · 已保存全部历史</p>
                ) : isAIConfigured() ? (
                  <p style={{ fontSize: '12px', color: '#8b5cf6', textAlign: 'center', marginTop: '8px' }}>✨ AI + 知识库</p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', marginTop: '8px' }}>💡 知识库模式</p>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: '8px', flexShrink: 0 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
              placeholder="问一个问题..."
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: '20px', fontSize: '14px', outline: 'none' }}
            />
            <button onClick={handleAsk} style={{ padding: '8px 16px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '20px', fontSize: '14px', cursor: 'pointer' }}>问</button>
          </div>
        </div>
      )}
    </>
  );
}
