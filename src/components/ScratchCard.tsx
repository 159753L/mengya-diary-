import { useState, useRef, useEffect } from 'react';

interface ScratchCardProps {
  secret: string;
  week: number;
  onReveal?: () => void;
}

export default function ScratchCard({ secret, week, onReveal }: ScratchCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isRevealed && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [isRevealed]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRevealed) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // 绘制刮刮图层
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // 检查刮开比例
    checkReveal();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const totalPixels = pixels.length / 4;
    const revealedPercentage = (transparentPixels / totalPixels) * 100;

    if (revealedPercentage > 50) {
      setIsRevealed(true);
      onReveal?.();
    }
  };

  // 一键刮开
  const revealAll = () => {
    setIsRevealed(true);
    onReveal?.();
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* 标题 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-700">本周宝宝秘密</h3>
        <p className="text-sm text-gray-400">第 {week} 周</p>
      </div>

      {/* 刮刮卡区域 */}
      <div
        ref={containerRef}
        className="relative bg-gradient-to-br from-pink-300 to-purple-300 rounded-2xl p-6 min-h-[200px] flex items-center justify-center overflow-hidden"
      >
        {/* 秘密内容底层 */}
        <div className="text-center">
          <p className="text-white text-lg font-medium leading-relaxed">
            {secret}
          </p>
        </div>

        {/* 刮刮层（顶层） */}
        {!isRevealed && (
          <canvas
            ref={canvasRef}
            width={300}
            height={180}
            className="absolute inset-0 w-full h-full cursor-grab touch-none"
            onMouseMove={handleMouseMove}
            onTouchMove={handleMouseMove}
            onMouseLeave={handleMouseMove}
          />
        )}

        {/* 刮刮层样式 */}
        {!isRevealed && (
          <div
            className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23ccc'/%3E%3C/svg%3E")`,
            }}
          >
            <canvas
              ref={canvasRef}
              width={300}
              height={180}
              className="w-full h-full cursor-grab touch-none"
              onMouseMove={handleMouseMove}
              onTouchMove={handleMouseMove}
            />
          </div>
        )}

        {/* 提示文字 */}
        {!isRevealed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-white/80 px-4 py-2 rounded-full text-sm text-gray-600">
              👆 刮开看看宝宝本周的变化
            </span>
          </div>
        )}
      </div>

      {/* 一键刮开按钮 */}
      {!isRevealed && (
        <button
          onClick={revealAll}
          className="w-full mt-4 bg-pink-100 text-pink-600 py-2 rounded-xl text-sm hover:bg-pink-200 transition-colors"
        >
          一键刮开 🔓
        </button>
      )}

      {/* 重新刮开按钮 */}
      {isRevealed && (
        <button
          onClick={() => {
            setIsRevealed(false);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (ctx && canvas) {
              ctx.globalCompositeOperation = 'source-over';
              ctx.fillStyle = '#f3f4f6';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
          }}
          className="w-full mt-4 bg-gray-100 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-200 transition-colors"
        >
          再刮一次 🔄
        </button>
      )}
    </div>
  );
}
