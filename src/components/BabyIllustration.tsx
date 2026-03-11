import { useMemo } from 'react';

interface BabyIllustrationProps {
  weekNumber: number;
  size?: 'small' | 'medium' | 'large';
}

// 40周宝宝状态数据
const BABY_STATES = [
  { week: 1, fruit: '芝麻', description: '受精卵准备着床', color: '#FFE4E1' },
  { week: 2, fruit: '芝麻', description: '胚胎开始形成', color: '#FFE4E1' },
  { week: 3, fruit: '芝麻', description: '胚胎成功着床', color: '#FFE4E1' },
  { week: 4, fruit: '苹果籽', description: '大脑和脊髓开始发育', color: '#FFE4E1' },
  { week: 5, fruit: '苹果籽', description: '心脏开始跳动', color: '#FFC0CB' },
  { week: 6, fruit: '蓝莓', description: '手臂和腿部开始形成', color: '#FFC0CB' },
  { week: 7, fruit: '蓝莓', description: '面部特征开始形成', color: '#FFB6C1' },
  { week: 8, fruit: '覆盆子', description: '开始有轻微的活动', color: '#FFB6C1' },
  { week: 9, fruit: '葡萄', description: '所有器官开始发育', color: '#FFB6C1' },
  { week: 10, fruit: '金桔', description: '手指脚趾完全形成', color: '#FFB6C1' },
  { week: 11, fruit: '无花果', description: '指甲和毛发开始生长', color: '#FFB6C1' },
  { week: 12, fruit: '枇杷', description: '开始有面部表情', color: '#FFDAB9' },
  { week: 13, fruit: '桃子', description: '指纹开始形成', color: '#FFDAB9' },
  { week: 14, fruit: '柠檬', description: '可以挤眉弄眼', color: '#FFDAB9' },
  { week: 15, fruit: '苹果', description: '开始有听觉', color: '#FFDAB9' },
  { week: 16, fruit: '牛油果', description: '头发和睫毛开始生长', color: '#FFE4B5' },
  { week: 17, fruit: '梨', description: '皮肤开始变厚', color: '#FFE4B5' },
  { week: 18, fruit: '石榴', description: '开始有明显的胎动', color: '#FFE4B5' },
  { week: 19, fruit: '芒果', description: '开始练习呼吸', color: '#FFE4B5' },
  { week: 20, fruit: '石榴', description: '可以分辨出性别', color: '#FFE0B2' },
  { week: 21, fruit: '香蕉', description: '眉毛和眼睑完全形成', color: '#FFE0B2' },
  { week: 22, fruit: '木瓜', description: '皮肤看起来更像新生儿', color: '#FFE0B2' },
  { week: 23, fruit: '火龙果', description: '可以听到外界声音', color: '#FFDEAD' },
  { week: 24, fruit: '椰子', description: '呼吸系统开始成熟', color: '#FFDEAD' },
  { week: 25, fruit: '菠萝', description: '身体开始储存脂肪', color: '#FFDEAD' },
  { week: 26, fruit: '甜瓜', description: '眼睛开始睁开', color: '#FFDEAD' },
  { week: 27, fruit: '花椰菜', description: '开始有规律的睡眠', color: '#E6E6FA' },
  { week: 28, fruit: '南瓜', description: '大脑活动增加', color: '#E6E6FA' },
  { week: 29, fruit: '椰子', description: '活动更加频繁', color: '#E6E6FA' },
  { week: 30, fruit: '柚子', description: '大脑褶皱越来越多', color: '#E6E6FA' },
  { week: 31, fruit: '椰子', description: '可以感受光线变化', color: '#D8BFD8' },
  { week: 32, fruit: '西瓜', description: '皮肤变得更柔软', color: '#D8BFD8' },
  { week: 33, fruit: '椰子', description: '呼吸系统接近成熟', color: '#D8BFD8' },
  { week: 34, fruit: '哈密瓜', description: '指甲完全形成', color: '#D8BFD8' },
  { week: 35, fruit: '甜瓜', description: '准备迎接外面的世界', color: '#DDA0DD' },
  { week: 36, fruit: '木瓜', description: '开始为出生做准备', color: '#DDA0DD' },
  { week: 37, fruit: '西瓜', description: '随时可能出生', color: '#DA70D6' },
  { week: 38, fruit: '西瓜', description: '肺部完全成熟', color: '#DA70D6' },
  { week: 39, fruit: '西瓜', description: '已经足月', color: '#DA70D6' },
  { week: 40, fruit: '大西瓜', description: '准备好与你见面！', color: '#FF69B4' },
];

// 可爱宝宝SVG插画 - 不同周数有不同姿态
const BabySVG = ({ week, size = 120 }: { week: number; size?: number }) => {
  // 根据周数选择不同的姿态
  let pose = 'sleeping';
  if (week >= 28) pose = 'awake';
  if (week >= 18 && week < 28) pose = 'moving';
  if (week < 8) pose = 'tiny';

  const colors = {
    skin: '#FFE4E1',
    cheek: '#FFB6C1',
    hair: '#8B4513',
    eye: '#4A4A4A',
  };

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-lg">
      {/* 光晕背景 */}
      <circle cx="60" cy="60" r="55" fill={colors.skin} opacity="0.3" />

      {/* 身体 */}
      {pose === 'sleeping' && (
        <>
          {/* 睡觉姿态 - 闭眼，侧躺 */}
          <ellipse cx="60" cy="70" rx="35" ry="30" fill={colors.skin} />
          {/* 头部 */}
          <circle cx="45" cy="50" r="28" fill={colors.skin} />
          {/* 头发 */}
          <path d="M25 40 Q30 25 45 30 Q55 20 65 35" stroke={colors.hair} strokeWidth="3" fill="none" />
          {/* 闭着的眼睛 */}
          <path d="M35 48 Q40 52 45 48" stroke="#4A4A4A" strokeWidth="2" fill="none" />
          <path d="M50 48 Q55 52 60 48" stroke="#4A4A4A" strokeWidth="2" fill="none" />
          {/* 脸颊 */}
          <circle cx="30" cy="55" r="5" fill={colors.cheek} opacity="0.5" />
          <circle cx="55" cy="55" r="5" fill={colors.cheek} opacity="0.5" />
          {/* 嘴巴 - 微笑 */}
          <path d="M42 62 Q48 68 54 62" stroke="#FF6B8A" strokeWidth="2" fill="none" />
          {/* 口水 */}
          <ellipse cx="55" cy="70" rx="2" ry="3" fill="#87CEEB" opacity="0.6" />
          {/* 小手 */}
          <circle cx="75" cy="60" r="8" fill={colors.skin} />
          <circle cx="80" cy="55" r="6" fill={colors.skin} />
        </>
      )}

      {pose === 'awake' && (
        <>
          {/* 清醒姿态 - 大眼睛，看前方 */}
          <ellipse cx="60" cy="75" rx="35" ry="25" fill={colors.skin} />
          {/* 头部 */}
          <circle cx="60" cy="50" r="30" fill={colors.skin} />
          {/* 头发 - 多了些 */}
          <path d="M30 40 Q35 20 55 25 Q70 15 85 30" stroke={colors.hair} strokeWidth="4" fill="none" />
          {/* 大眼睛 */}
          <circle cx="48" cy="48" r="8" fill="white" />
          <circle cx="48" cy="48" r="5" fill={colors.eye} />
          <circle cx="50" cy="46" r="2" fill="white" />
          <circle cx="72" cy="48" r="8" fill="white" />
          <circle cx="72" cy="48" r="5" fill={colors.eye} />
          <circle cx="74" cy="46" r="2" fill="white" />
          {/* 脸颊 */}
          <circle cx="35" cy="58" r="6" fill={colors.cheek} opacity="0.5" />
          <circle cx="75" cy="58" r="6" fill={colors.cheek} opacity="0.5" />
          {/* 微笑 */}
          <path d="M48 65 Q55 72 62 65" stroke="#FF6B8A" strokeWidth="2.5" fill="none" />
          {/* 小手挥动 */}
          <ellipse cx="90" cy="50" rx="10" ry="8" fill={colors.skin} />
          <ellipse cx="30" cy="55" rx="8" ry="10" fill={colors.skin} />
        </>
      )}

      {pose === 'moving' && (
        <>
          {/* 活动姿态 - 胎动，手脚动 */}
          <ellipse cx="60" cy="75" rx="32" ry="28" fill={colors.skin} />
          {/* 头部 */}
          <circle cx="50" cy="48" r="26" fill={colors.skin} />
          {/* 头发 */}
          <path d="M28 38 Q32 22 48 28 Q60 18 72 32" stroke={colors.hair} strokeWidth="3" fill="none" />
          {/* 眼睛 - 好奇地睁大 */}
          <circle cx="40" cy="46" r="7" fill="white" />
          <circle cx="40" cy="46" r="4" fill={colors.eye} />
          <circle cx="58" cy="46" r="7" fill="white" />
          <circle cx="58" cy="46" r="4" fill={colors.eye} />
          {/* 表情 - 好奇 */}
          <circle cx="35" cy="55" r="5" fill={colors.cheek} opacity="0.5" />
          <circle cx="62" cy="55" r="5" fill={colors.cheek} opacity="0.5" />
          {/* 张嘴 - 好奇地 */}
          <ellipse cx="50" cy="60" rx="5" ry="4" fill="#FF6B8A" />
          {/* 手脚在动 */}
          <ellipse cx="85" cy="45" r="8" fill={colors.skin} />
          <ellipse cx="25" cy="60" r="7" fill={colors.skin} />
          <ellipse cx="75" cy="90" r="9" fill={colors.skin} />
        </>
      )}

      {pose === 'tiny' && (
        <>
          {/* 很小的时候 - 蜷缩 */}
          <ellipse cx="60" cy="70" rx="25" ry="20" fill={colors.skin} />
          <circle cx="50" cy="55" r="20" fill={colors.skin} />
          {/* 还没头发 */}
          {/* 闭眼 */}
          <path d="M42 52 Q46 55 50 52" stroke="#4A4A4A" strokeWidth="1.5" fill="none" />
          <path d="M54 52 Q58 55 62 52" stroke="#4A4A4A" strokeWidth="1.5" fill="none" />
          <circle cx="32" cy="58" r="3" fill={colors.cheek} opacity="0.4" />
          <circle cx="62" cy="58" r="3" fill={colors.cheek} opacity="0.4" />
          <path d="M46 65 Q50 68 54 65" stroke="#FF6B8A" strokeWidth="1.5" fill="none" />
        </>
      )}
    </svg>
  );
};

export default function BabyIllustration({ weekNumber, size = 'medium' }: BabyIllustrationProps) {
  const babyState = useMemo(() => {
    const week = Math.min(Math.max(weekNumber, 1), 40);
    return BABY_STATES[week - 1] || BABY_STATES[0];
  }, [weekNumber]);

  const sizeMap = {
    small: 60,
    medium: 120,
    large: 180,
  };

  const svgSize = sizeMap[size];

  return (
    <div className="flex flex-col items-center">
      {/* 宝宝插画 */}
      <div className={`relative mb-3`}>
        {/* 动态光晕 */}
        <div
          className="absolute rounded-full opacity-20 animate-pulse"
          style={{
            width: svgSize + 40,
            height: svgSize + 40,
            left: -20,
            top: -20,
            backgroundColor: babyState.color,
            animationDuration: '2s',
          }}
        />
        {/* SVG插画 */}
        <BabySVG week={weekNumber} size={svgSize} />
      </div>

      {/* 宝宝状态文字 */}
      <p className="text-gray-600 text-center font-medium">
        宝宝像 {babyState.fruit} 一样大
      </p>
      <p className="text-gray-400 text-sm text-center mt-1">
        {babyState.description}
      </p>
    </div>
  );
}
