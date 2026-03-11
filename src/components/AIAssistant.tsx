import { useState, useRef } from 'react';
import { getAnswer, isAIConfigured } from '../lib/aiService';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    try {
      const result = await getAnswer(query);
      setAnswer(result);
    } catch (error) {
      setAnswer('抱歉，我现在有点累，让我休息一下...');
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
        <div style={{
          position: 'fixed',
          left: (pos.x - 310) + 'px',
          top: pos.y + 'px',
          zIndex: 2147483646,
          width: '300px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #a78bfa, #6366f1)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold' }}>孕期小助手</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          </div>

          <div style={{ padding: '16px', maxHeight: '200px', overflowY: 'auto' }}>
            {loading ? (
              <p style={{ fontSize: '14px', color: '#999', textAlign: 'center' }}>🤔 思考中...</p>
            ) : answer ? (
              <div>
                <p style={{ fontSize: '12px', color: '#a78bfa', marginBottom: '8px' }}>问：{query}</p>
                <p style={{ fontSize: '14px', color: '#333' }}>{answer}</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '14px', color: '#999', textAlign: 'center' }}>有什么孕期问题可以问我哦～</p>
                {isAIConfigured() ? (
                  <p style={{ fontSize: '12px', color: '#8b5cf6', textAlign: 'center', marginTop: '8px' }}>✨ AI + 知识库 (RAG)</p>
                ) : (
                  <p style={{ fontSize: '12px', color: '#ccc', textAlign: 'center', marginTop: '8px' }}>💡 知识库模式</p>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
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
