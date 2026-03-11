import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserInfo, DailyRecord, MoodType } from '../types';
import { calculatePregnancyWeek, calculateDaysUntilDue, getDateString, generateId } from '../lib/utils';
import { saveUserInfo, getUserInfo, saveRecord, getRecordByDate, getRecords, getDadContributionCount } from '../lib/storage';
import { getCurrentWeekInfo, getCheckCountdown } from '../data/weekInfo';
import { randomPick } from '../lib/utils';
import { QUESTIONS, MOOD_RESPONSES } from '../data/questions';
import { saveRecordToSupabase, sendDadMessage as sendDadMessageToSupabase, sendKiss as sendKissToSupabase, isSupabaseReady } from '../lib/supabase';

interface AppState {
  userInfo: UserInfo | null;
  currentWeek: number;
  currentDay: number;
  phase: 'first' | 'second' | 'third';
  daysUntilDue: number;
  weekInfo: ReturnType<typeof getCurrentWeekInfo>;
  checkCountdown: ReturnType<typeof getCheckCountdown>;
  todayRecord: DailyRecord | null;
  allRecords: DailyRecord[];
  dadContributionCount: number;
  currentQuestion: { type: string; text: string };
}

interface AppContextType extends AppState {
  setUserInfo: (info: UserInfo) => void;
  saveTodayRecord: (momMessage: string, momMood: MoodType, dadMessage?: string) => void;
  saveDadMessage: (message: string) => void;
  sendKiss: () => void;
  getMoodResponse: (mood: MoodType) => string;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfoState] = useState<UserInfo | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  const [phase, setPhase] = useState<'first' | 'second' | 'third'>('first');
  const [daysUntilDue, setDaysUntilDue] = useState(280);
  const [weekInfo, setWeekInfo] = useState(getCurrentWeekInfo(1));
  const [checkCountdown, setCheckCountdown] = useState<ReturnType<typeof getCheckCountdown>>(null);
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [dadContributionCount, setDadContributionCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<{ type: string; text: string }>(QUESTIONS.physical[0]);

  // 初始化
  useEffect(() => {
    const info = getUserInfo();
    if (info) {
      setUserInfoState(info);
      const { week, day, phase: p } = calculatePregnancyWeek(info.dueDate);
      setCurrentWeek(week);
      setCurrentDay(day);
      setPhase(p);
      setDaysUntilDue(calculateDaysUntilDue(info.dueDate));
      setWeekInfo(getCurrentWeekInfo(week));
      setCheckCountdown(getCheckCountdown(week));

      // 加载今日记录
      const today = getDateString();
      const record = getRecordByDate(today);
      setTodayRecord(record);

      // 加载所有记录
      setAllRecords(getRecords());
      setDadContributionCount(getDadContributionCount());
    }

    // 随机选择一个问题
    const types: ('physical' | 'emotional' | 'reality')[] = ['physical', 'emotional', 'reality'];
    const randomType = randomPick(types);
    setCurrentQuestion(randomPick(QUESTIONS[randomType]));
  }, []);

  // 设置用户信息
  const setUserInfo = (info: UserInfo) => {
    saveUserInfo(info);
    setUserInfoState(info);

    const { week, day, phase: p } = calculatePregnancyWeek(info.dueDate);
    setCurrentWeek(week);
    setCurrentDay(day);
    setPhase(p);
    setDaysUntilDue(calculateDaysUntilDue(info.dueDate));
    setWeekInfo(getCurrentWeekInfo(week));
    setCheckCountdown(getCheckCountdown(week));
  };

  // 保存今日记录
  const saveTodayRecord = async (momMessage: string, momMood: MoodType, dadMessage?: string) => {
    const record: DailyRecord = {
      id: todayRecord?.id || generateId(),
      date: getDateString(),
      weekNumber: currentWeek,
      dayNumber: currentDay,
      momMessage,
      momMood,
      dadMessage,
      hasDadInteraction: !!dadMessage,
      dadMessageTime: dadMessage ? Date.now() : undefined,
      kissSent: todayRecord?.kissSent,
      kissTime: todayRecord?.kissTime,
      createdAt: todayRecord?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    // 保存到本地存储
    saveRecord(record);
    setTodayRecord(record);
    setAllRecords(getRecords());
    if (dadMessage) {
      setDadContributionCount(getDadContributionCount());
    }

    // 如果 Supabase 可用，同步到云端
    if (isSupabaseReady()) {
      await saveRecordToSupabase({
        id: record.id,
        date: record.date,
        weekNumber: record.weekNumber,
        momMessage: record.momMessage,
        momMood: record.momMood,
        dadMessage: record.dadMessage,
        hasDadInteraction: record.hasDadInteraction,
        createdAt: record.createdAt,
      });
    }
  };

  // 保存爸爸留言
  const saveDadMessage = async (message: string) => {
    if (todayRecord) {
      const updated: DailyRecord = {
        ...todayRecord,
        dadMessage: message,
        hasDadInteraction: true,
        dadMessageTime: Date.now(),
        updatedAt: Date.now(),
      };
      saveRecord(updated);
      setTodayRecord(updated);
      setAllRecords(getRecords());
      setDadContributionCount(getDadContributionCount());

      // 如果 Supabase 可用，同步到云端
      if (isSupabaseReady()) {
        await sendDadMessageToSupabase(todayRecord.id, message);
      }
    }
  };

  // 发送飞吻
  const sendKiss = async () => {
    if (todayRecord) {
      const updated: DailyRecord = {
        ...todayRecord,
        kissSent: true,
        kissTime: Date.now(),
        updatedAt: Date.now(),
      };
      saveRecord(updated);
      setTodayRecord(updated);

      // 如果 Supabase 可用，同步到云端并触发震动
      if (isSupabaseReady()) {
        await sendKissToSupabase(todayRecord.id);
      }
    }
  };

  // 获取心情回应
  const getMoodResponse = (mood: MoodType): string => {
    return MOOD_RESPONSES[mood]?.[phase] || MOOD_RESPONSES[mood]?.first || '宝宝感受到了你的爱～';
  };

  return (
    <AppContext.Provider
      value={{
        userInfo,
        currentWeek,
        currentDay,
        phase,
        daysUntilDue,
        weekInfo,
        checkCountdown,
        todayRecord,
        allRecords,
        dadContributionCount,
        currentQuestion,
        setUserInfo,
        saveTodayRecord,
        saveDadMessage,
        sendKiss,
        getMoodResponse,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
