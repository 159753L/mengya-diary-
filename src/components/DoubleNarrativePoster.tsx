import { useRef } from 'react';
import { toPng } from 'html-to-image';

interface DoubleNarrativePosterProps {
  babyName: string;
  weekNumber: number;
  fruit: string;
  momMessage: string;
  momMood: string;
  dadMessage?: string;
  date: string;
  onGenerate?: (dataUrl: string) => void;
}

export default function DoubleNarrativePoster({
  babyName,
  weekNumber,
  fruit,
  momMessage,
  momMood,
  dadMessage,
  date,
  onGenerate,
}: DoubleNarrativePosterProps) {
  const posterRef = useRef<HTMLDivElement>(null);

  const getMoodEmoji = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: '😊',
      tired: '😴',
      anxious: '😰',
      expectant: '🤗',
      moved: '🥹',
    };
    return moodMap[mood] || '💕';
  };

  const handleGenerate = async () => {
    if (!posterRef.current) return;

    try {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95 });
      onGenerate?.(dataUrl);
    } catch (err) {
      console.error('生成海报失败', err);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div>
      {/* 海报预览 */}
      <div
        ref={posterRef}
        className="bg-white rounded-3xl p-6 shadow-xl"
        style={{ width: '320px' }}
      >
        {/* 顶部 - 宝宝信息 */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">{fruit}</div>
          <h2 className="text-xl font-bold text-gray-700">{babyName}的第{weekNumber}周</h2>
          <p className="text-gray-500 text-sm">孕{weekNumber}周</p>
        </div>

        {/* 中间 - 宝宝插画区 */}
        <div className="flex items-center justify-center my-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 flex items-center justify-center">
              <span className="text-4xl">{getMoodEmoji(momMood)}</span>
            </div>
          </div>
        </div>

        {/* 翅膀分隔 */}
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
          <span className="text-pink-400">💕</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
        </div>

        {/* 双叙事区域 - 爸爸妈妈留言 */}
        {dadMessage ? (
          <div className="space-y-3">
            {/* 妈妈留言 - 左侧翅膀 */}
            <div className="flex">
              <div className="bg-pink-50 rounded-2xl p-3 flex-1 relative">
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-pink-50 transform rotate-45" />
                <p className="text-xs text-pink-500 mb-1">👩 妈妈</p>
                <p className="text-gray-600 text-sm">{momMessage}</p>
              </div>
            </div>

            {/* 爸爸留言 - 右侧翅膀 */}
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-2xl p-3 flex-1 relative">
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-50 transform rotate-45" />
                <p className="text-xs text-blue-500 mb-1">👨 爸爸</p>
                <p className="text-gray-600 text-sm">{dadMessage}</p>
              </div>
            </div>
          </div>
        ) : (
          // 单人版 - 只有妈妈
          <div className="bg-pink-50 rounded-2xl p-4">
            <p className="text-xs text-pink-500 mb-2">👩 妈妈说：</p>
            <p className="text-gray-600 text-center">{momMessage}</p>
          </div>
        )}

        {/* 底部日期 */}
        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <p className="text-gray-400 text-xs">{formattedDate}</p>
          <p className="text-gray-300 text-xs mt-1">🌱 萌芽日记</p>
        </div>
      </div>

      {/* 操作按钮 */}
      <button
        onClick={handleGenerate}
        className="w-full mt-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-3 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
      >
        生成海报 📸
      </button>
    </div>
  );
}