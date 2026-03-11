// 计算孕周
export function calculatePregnancyWeek(dueDate: string): { week: number; day: number; phase: 'first' | 'second' | 'third' } {
  const due = new Date(dueDate);
  const today = new Date();

  // 预产期是40周后
  const conceptionDate = new Date(due);
  conceptionDate.setDate(conceptionDate.getDate() - 280); // 40周 = 280天

  const daysPassed = Math.floor((today.getTime() - conceptionDate.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.floor(daysPassed / 7) + 1;
  const day = (daysPassed % 7) + 1;

  // 确定孕期阶段
  let phase: 'first' | 'second' | 'third' = 'first';
  if (week > 12 && week <= 27) {
    phase = 'second';
  } else if (week > 27) {
    phase = 'third';
  }

  return { week: Math.max(1, Math.min(week, 42)), day, phase };
}

// 计算距离预产期天数
export function calculateDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const days = Math.floor((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

// 获取日期字符串
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// 获取孕周主题
export function getThemeByWeek(week: number): string {
  if (week <= 12) return 'first';
  if (week <= 27) return 'second';
  return 'third';
}

// 随机选择数组元素
export function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
