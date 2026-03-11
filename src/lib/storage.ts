import type { UserInfo, DailyRecord } from '../types';

// 模拟Firebase的localStorage存储
// 后续可以轻松替换为真实的Firebase

const STORAGE_KEYS = {
  USER_INFO: 'mengya_user_info',
  RECORDS: 'mengya_records',
};

// 用户信息
export function saveUserInfo(info: UserInfo): void {
  localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(info));
}

export function getUserInfo(): UserInfo | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER_INFO);
  return data ? JSON.parse(data) : null;
}

export function clearUserInfo(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
}

// 记录
export function saveRecord(record: DailyRecord): void {
  const records = getRecords();
  const existingIndex = records.findIndex(r => r.date === record.date);

  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }

  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
}

export function getRecords(): DailyRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.RECORDS);
  return data ? JSON.parse(data) : [];
}

export function getRecordByDate(date: string): DailyRecord | null {
  const records = getRecords();
  return records.find(r => r.date === date) || null;
}

export function getDadContributionCount(): number {
  const records = getRecords();
  return records.filter(r => r.hasDadInteraction).length;
}

// 导出数据
export function exportData(): string {
  const userInfo = getUserInfo();
  const records = getRecords();

  return JSON.stringify({ userInfo, records }, null, 2);
}

// 清空所有数据
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
}
