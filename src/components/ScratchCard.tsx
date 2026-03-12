import { useRef, useEffect, useCallback } from 'react';

interface ScratchCardProps {
  secret: string;
  week: number;
  onReveal?: () => void;
}

export default function ScratchCard({ secret, week, onReveal }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawing = useRef(false);

  // 初始化遮罩
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // 设置canvas大小与容器一致
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 实体遮罩 - 银灰色，完全不透明
    ctx.fillStyle = '#B5B5B5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 添加纹理
    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#C5C5C5' : '#A5A5A5';
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2 + 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // 提示文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👆 刮开看看宝宝的变化', canvas.width / 2, canvas.height / 2);
  }, []);

  // 获取坐标
  const getCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;

    const rect = container.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // 刮擦动作
  const doScratch = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const coords = getCoords(clientX, clientY);
    if (!canvas || !coords) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 擦除
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, 30, 0, Math.PI * 2);
    ctx.fill();

    // 散落
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * 20 + 5;
      ctx.beginPath();
      ctx.arc(coords.x + Math.cos(a) * d, coords.y + Math.sin(a) * d, Math.random() * 5 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [getCoords]);

  // 事件处理
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    if ('touches' in e) {
      const touch = e.touches[0];
      doScratch(touch.clientX, touch.clientY);
    } else {
      doScratch(e.clientX, e.clientY);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    if ('touches' in e) {
      e.preventDefault();
      const touch = e.touches[0];
      doScratch(touch.clientX, touch.clientY);
    } else {
      doScratch(e.clientX, e.clientY);
    }
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  // 一键刮开
  const revealAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    onReveal?.();
  };

  // 重置
  const reset = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = container.getBoundingClientRect().width;
    canvas.height = container.getBoundingClientRect().height;

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#B5B5B5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 60; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#C5C5C5' : '#A5A5A5';
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2 + 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👆 刮开看看宝宝的变化', canvas.width / 2, canvas.height / 2);
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-700">本周宝宝秘密</h3>
        <p className="text-sm text-gray-400">第 {week} 周</p>
      </div>

      {/* 容器 - 关键是用 relative + 固定高度 */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '180px',
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* 底层 - 秘密文字 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(to bottom right, #f9a8d4, #a78bfa)'
          }}
        >
          <p
            style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: '500',
              padding: '20px',
              textAlign: 'center',
              lineHeight: 1.6
            }}
          >
            {secret}
          </p>
        </div>

        {/* 遮罩层 - canvas */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            cursor: 'grab',
            touchAction: 'none'
          }}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={revealAll}
          className="w-full bg-pink-100 text-pink-600 py-2 rounded-xl text-sm hover:bg-pink-200"
        >
          一键刮开 🔓
        </button>
        <button
          onClick={reset}
          className="w-full bg-gray-100 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-200"
        >
          再刮一次 🔄
        </button>
      </div>
    </div>
  );
}
