import type { WeekInfo, PrenatalCheck } from '../types';

// 40周孕周信息
export const WEEK_INFO: WeekInfo[] = [
  { week: 1, fruit: '芝麻', description: '受精卵准备着床', development: '身体开始为怀孕做准备' },
  { week: 2, fruit: '芝麻', description: '胚胎开始形成', development: '子宫内膜增厚，为胚胎提供营养' },
  { week: 3, fruit: '芝麻', description: '胚胎成功着床', development: '心脏开始形成' },
  { week: 4, fruit: '芝麻', description: '像苹果籽一样大', development: '大脑和脊髓开始发育' },
  { week: 5, fruit: '苹果籽', description: '开始有小心跳', development: '心脏开始跳动' },
  { week: 6, fruit: '蓝莓', description: '开始长小手脚', development: '手臂和腿部开始形成' },
  { week: 7, fruit: '蓝莓', description: '有了小鼻子', development: '面部特征开始形成' },
  { week: 8, fruit: '覆盆子', description: '开始能动啦', development: '开始有轻微的活动' },
  { week: 9, fruit: '葡萄', description: '正式成为胎儿', development: '所有器官开始发育' },
  { week: 10, fruit: '金桔', description: '手指脚趾形成', development: '已经完全成型' },
  { week: 11, fruit: '无花果', description: '开始长指甲', development: '指甲和毛发开始生长' },
  { week: 12, fruit: '枇杷', description: '会打哈欠了', development: '开始有面部表情' },
  { week: 13, fruit: '桃子', description: '有了独特指纹', development: '指纹开始形成' },
  { week: 14, fruit: '柠檬', description: '会做鬼脸了', development: '可以挤眉弄眼' },
  { week: 15, fruit: '苹果', description: '能听到声音啦', development: '开始有听觉' },
  { week: 16, fruit: '牛油果', description: '开始长头发', development: '头发和睫毛开始生长' },
  { week: 17, fruit: '梨', description: '指纹更清晰', development: '皮肤开始变厚' },
  { week: 18, fruit: '石榴', description: '会踢腿啦', development: '开始有明显的胎动' },
  { week: 19, fruit: '芒果', description: '能吞咽羊水', development: '开始练习呼吸' },
  { week: 20, fruit: '石榴', description: '有一半啦！', development: '可以分辨出性别' },
  { week: 21, fruit: '香蕉', description: '有了小眉毛', development: '眉毛和眼睑完全形成' },
  { week: 22, fruit: '木瓜', description: '像小宝宝了', development: '皮肤看起来更像新生儿' },
  { week: 23, fruit: '火龙果', description: '听力更灵敏', development: '可以听到外界声音' },
  { week: 24, fruit: '椰子', description: '肺部开始发育', development: '呼吸系统开始成熟' },
  { week: 25, fruit: '菠萝', description: '开始长脂肪', development: '身体开始储存脂肪' },
  { week: 26, fruit: '甜瓜', description: '眼睛能睁开了', development: '眼睛开始睁开' },
  { week: 27, fruit: '花椰菜', description: '有了睡眠周期', development: '开始有规律的睡眠' },
  { week: 28, fruit: '南瓜', description: '会做梦啦', development: '大脑活动增加' },
  { week: 29, fruit: '椰子', description: '更活泼好动', development: '活动更加频繁' },
  { week: 30, fruit: '柚子', description: '大脑快速发育', development: '大脑褶皱越来越多' },
  { week: 31, fruit: '椰子', description: '能分辨明暗', development: '可以感受光线变化' },
  { week: 32, fruit: '西瓜', description: '越来越可爱', development: '皮肤变得更柔软' },
  { week: 33, fruit: '椰子', description: '肺部快成熟', development: '呼吸系统接近成熟' },
  { week: 34, fruit: '哈密瓜', description: '指甲长全了', development: '指甲完全形成' },
  { week: 35, fruit: '甜瓜', description: '脂肪继续增加', development: '准备迎接外面的世界' },
  { week: 36, fruit: '木瓜', description: '准备入盆啦', development: '开始为出生做准备' },
  { week: 37, fruit: '西瓜', description: '足月啦！', development: '随时可能出生' },
  { week: 38, fruit: '西瓜', description: '继续长胖', development: '肺部完全成熟' },
  { week: 39, fruit: '西瓜', description: '随时发动', development: '已经足月' },
  { week: 40, fruit: '大西瓜', description: '宝宝来啦！', development: '准备好与你见面！' },
];

// 产检提醒
export const PRENATAL_CHECKS: PrenatalCheck[] = [
  {
    week: 12,
    name: '建档/第一次产检',
    description: '确认怀孕，建立产检档案',
    reminderText: '小名后天要去进行第一次大检查啦，别担心，爸爸妈妈陪着你呢～',
  },
  {
    week: 16,
    name: '唐氏综合征筛查',
    description: '排查唐氏综合征风险',
    reminderText: '下周要去做唐筛啦，这是了解小名健康的重要检查～',
  },
  {
    week: 24,
    name: '大排畸',
    description: '详细检查胎儿器官发育',
    reminderText: '大排畸要来啦！这可是我们第一次看清小名长什么样呢～',
  },
  {
    week: 28,
    name: '糖耐量测试',
    description: '筛查妊娠糖尿病',
    reminderText: '糖耐检查要做了，记得空腹哦～为了小名健康，一切都值得！',
  },
  {
    week: 32,
    name: '小排畸',
    description: '孕晚期超声检查',
    reminderText: '32周小排畸来啦，看看小名现在长多大啦～',
  },
  {
    week: 36,
    name: '产前鉴定',
    description: '评估分娩方式',
    reminderText: '36周啦！离与小名见面越来越近～',
  },
];

// 获取当前孕周的宝宝信息
export function getCurrentWeekInfo(week: number): WeekInfo {
  return WEEK_INFO[Math.min(week - 1, 39)] || WEEK_INFO[0];
}

// 获取即将到来的产检
export function getUpcomingCheck(week: number): PrenatalCheck | null {
  const upcoming = PRENATAL_CHECKS.find(check => check.week > week);
  return upcoming || null;
}

// 获取产检倒计时
export function getCheckCountdown(week: number): { check: PrenatalCheck; daysUntil: number } | null {
  const upcoming = getUpcomingCheck(week);
  if (!upcoming) return null;

  const daysUntil = (upcoming.week - week) * 7;
  return { check: upcoming, daysUntil };
}
