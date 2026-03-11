// 用户信息
export interface UserInfo {
  dueDate: string; // 预产期
  babyName: string; // 宝宝小名
  lastPeriodDate?: string; // 末次月经日期
  createdAt: number;
}

// 每日记录
export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weekNumber: number; // 孕周
  dayNumber: number; // 孕天

  // 妈妈记录
  momMessage: string;
  momMood: MoodType;

  // 爸爸记录
  dadMessage?: string;
  dadMood?: MoodType;
  hasDadInteraction: boolean;
  dadMessageTime?: number;

  // 飞吻
  kissSent?: boolean;
  kissTime?: number;

  // 创建时间
  createdAt: number;
  updatedAt: number;
}

// 心情类型
export type MoodType = 'happy' | 'tired' | 'anxious' | 'expectant' | 'moved';

// 心情选项
export const MOOD_OPTIONS: { type: MoodType; label: string; emoji: string }[] = [
  { type: 'happy', label: '开心', emoji: '😊' },
  { type: 'tired', label: '疲惫', emoji: '😴' },
  { type: 'anxious', label: '焦虑', emoji: '😰' },
  { type: 'expectant', label: '期待', emoji: '🤗' },
  { type: 'moved', label: '感动', emoji: '🥹' },
];

// 爸爸快捷回复
export const DAD_QUICK_REPLIES = [
  '辛苦了老婆 💕',
  '宝贝要乖哦 👶',
  '爸爸今天加班会早点回家',
  '期待与你见面 ❤️',
  '今天宝宝有动静吗？',
];

// 问题类型
export type QuestionType = 'physical' | 'emotional' | 'reality';

// 问题
export interface Question {
  type: QuestionType;
  text: string;
}

// 产检提醒
export interface PrenatalCheck {
  week: number;
  name: string;
  description: string;
  reminderText: string;
}

// 孕周信息
export interface WeekInfo {
  week: number;
  fruit: string; // 水果类比
  description: string;
  development: string; // 宝宝发育
}

// 爸爸贡献记录
export interface DadContribution {
  date: string;
  hasContributed: boolean;
}
