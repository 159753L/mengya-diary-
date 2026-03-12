import { useRef } from 'react';
import { toPng } from 'html-to-image';
import BabyIllustration from './BabyIllustration';

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

// 宝宝每周发育状态
const getBabyDevelopment = (week: number): string => {
  const developments: Record<number, string> = {
    1: '受精卵准备着床',
    2: '胚胎开始形成',
    3: '神经系统快速发育',
    4: '大脑和脊髓开始发育',
    5: '心脏开始跳动',
    6: '手臂和腿部开始形成',
    7: '面部特征逐渐形成',
    8: '开始有轻微的活动',
    9: '所有器官开始发育',
    10: '手指脚趾完全形成',
    11: '指甲和毛发开始生长',
    12: '开始有面部表情',
    13: '指纹开始形成',
    14: '可以挤眉弄眼',
    15: '开始有听觉',
    16: '头发和睫毛开始生长',
    17: '皮肤开始变厚',
    18: '开始有明显的胎动',
    19: '开始练习呼吸',
    20: '可以分辨出性别',
    21: '眉毛和眼睑完全形成',
    22: '皮肤看起来更像新生儿',
    23: '可以听到外界声音',
    24: '呼吸系统开始成熟',
    25: '身体开始储存脂肪',
    26: '眼睛开始睁开',
    27: '开始有规律的睡眠',
    28: '大脑活动增加',
    29: '活动更加频繁',
    30: '大脑褶皱越来越多',
    31: '可以感受光线变化',
    32: '皮肤变得更柔软',
    33: '呼吸系统接近成熟',
    34: '指甲完全形成',
    35: '准备迎接外面的世界',
    36: '开始为出生做准备',
    37: '随时可能出生',
    38: '肺部完全成熟',
    39: '已经足月',
    40: '准备好与你见面！',
  };
  return developments[week] || '健康成长中';
};

// 孕期阶段对应的渐变色
const getPhaseColors = (week: number): { bg: string; accent: string } => {
  if (week <= 12) {
    return { bg: 'from-green-50 to-emerald-100', accent: 'emerald' };
  } else if (week <= 27) {
    return { bg: 'from-orange-50 to-amber-100', accent: 'orange' };
  } else {
    return { bg: 'from-blue-50 to-sky-100', accent: 'sky' };
  }
};

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

  const getMoodText = (mood: string) => {
    const moodMap: Record<string, string> = {
      happy: '开心',
      tired: '疲惫',
      anxious: '焦虑',
      expectant: '期待',
      moved: '感动',
    };
    return moodMap[mood] || '美好';
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

  const phaseColors = getPhaseColors(weekNumber);
  const development = getBabyDevelopment(weekNumber);

  return (
    <div>
      {/* 海报预览 - 更精致的设计 */}
      <div
        ref={posterRef}
        className="relative overflow-hidden rounded-3xl"
        style={{
          width: '340px',
          background: `linear-gradient(135deg, #fff5f7 0%, #faf5ff 50%, #f0f9ff 100%)`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        }}
      >
        {/* 背景装饰 - 星星 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-4 left-4 text-pink-200 text-xl">✨</div>
          <div className="absolute top-8 right-8 text-purple-200 text-lg">🌸</div>
          <div className="absolute bottom-12 left-8 text-blue-200 text-lg">💫</div>
          <div className="absolute bottom-8 right-6 text-pink-200 text-xl">❤️</div>
          <div className="absolute top-1/2 left-2 text-yellow-200 text-sm">⭐</div>
          <div className="absolute top-1/3 right-4 text-purple-200 text-sm">✨</div>
        </div>

        {/* 主内容区域 */}
        <div className="relative p-6">
          {/* 顶部 - 孕周信息 */}
          <div className="text-center mb-2">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
              <span className="text-2xl">🌱</span>
              <span className="text-sm font-medium text-gray-600">孕第{weekNumber}周</span>
            </div>
          </div>

          {/* 宝宝插画区域 - 中心 */}
          <div className="flex justify-center my-4">
            <div className="relative">
              {/* 光晕效果 */}
              <div
                className="absolute inset-0 rounded-full opacity-30 blur-xl"
                style={{
                  background: 'linear-gradient(135deg, #f9a8d4, #a78bfa)',
                  transform: 'scale(1.5)',
                }}
              />
              {/* 宝宝插画 */}
              <div className="relative z-10">
                <BabyIllustration weekNumber={weekNumber} size="medium" />
              </div>
            </div>
          </div>

          {/* 宝宝发育状态 */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-sm">
              <span className="text-lg">👶</span>
              <span className="text-sm text-gray-600">
                宝宝像{fruit}一样大 · {development}
              </span>
            </div>
          </div>

          {/* 心情标签 */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white px-4 py-1.5 rounded-full shadow-md">
              <span>{getMoodEmoji(momMood)}</span>
              <span className="text-sm font-medium">今天{momMessage ? '心情' : '是'}{getMoodText(momMood)}的一天</span>
            </div>
          </div>

          {/* 爸爸妈妈留言区域 - 翅膀形状 */}
          <div className="relative my-4">
            {/* 翅膀背景装饰 */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-pink-300 to-transparent" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                <span className="text-pink-400">💕</span>
              </div>
            </div>
          </div>

          {/* 留言内容 */}
          {dadMessage ? (
            <div className="space-y-3">
              {/* 妈妈留言 - 粉色背景 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border-l-4 border-pink-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👩</span>
                  <span className="text-sm font-medium text-pink-500">妈妈</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{momMessage}</p>
              </div>

              {/* 爸爸留言 - 蓝色背景 */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border-r-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👨</span>
                  <span className="text-sm font-medium text-blue-500">爸爸</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{dadMessage}</p>
              </div>
            </div>
          ) : (
            // 单人版 - 只有妈妈
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border-l-4 border-pink-400">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">👩</span>
                <span className="text-sm font-medium text-pink-500">妈妈说</span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed text-center">{momMessage}</p>
            </div>
          )}

          {/* 底部信息 */}
          <div className="mt-6 pt-4 border-t border-gray-200/50">
            <div className="flex justify-between items-center">
              <div className="text-gray-400 text-xs">
                {formattedDate}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-lg">🌱</span>
                <span className="text-sm font-medium bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  萌芽日记
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 角落装饰 */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-30" />
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-30" />
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
