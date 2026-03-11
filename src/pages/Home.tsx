import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import BottomNav from '../components/BottomNav';
import BabyIllustration from '../components/BabyIllustration';

export default function Home() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo, currentWeek, currentDay, phase, daysUntilDue, weekInfo, checkCountdown, todayRecord } = useApp();

  const [dueDate, setDueDate] = useState(userInfo?.dueDate || '');
  const [babyName, setBabyName] = useState(userInfo?.babyName || '');
  const [step, setStep] = useState(userInfo ? 'logged' : 'input');
  const [showDadNotification, setShowDadNotification] = useState(false);

  // 检测爸爸留言并显示通知
  useEffect(() => {
    if (todayRecord?.hasDadInteraction && todayRecord.dadMessageTime) {
      // 检查是否在最近5分钟内收到的爸爸留言
      const now = Date.now();
      const messageTime = todayRecord.dadMessageTime;
      if (now - messageTime < 5 * 60 * 1000) {
        setShowDadNotification(true);
        // 震动反馈
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        // 5秒后自动隐藏通知
        setTimeout(() => setShowDadNotification(false), 5000);
      }
    }
  }, [todayRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate || !babyName) return;

    setUserInfo({
      dueDate,
      babyName,
      createdAt: Date.now(),
    });
    setStep('logged');
  };

  // 已登录用户看到的首页
  if (step === 'logged') {
    return (
      <div
        className="min-h-screen p-6 flex flex-col items-center justify-center"
        data-theme={phase === 'first' ? '' : phase === 'second' ? 'second' : 'third'}
        style={{
          background: `linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-primary) 100%)`,
        }}
      >
        {/* 爸爸留言通知气泡 */}
        {showDadNotification && todayRecord?.dadMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-4 py-3 rounded-full shadow-lg flex items-center gap-2 max-w-sm">
              <span className="text-xl">👨</span>
              <div>
                <p className="text-sm font-medium">爸爸留言了</p>
                <p className="text-xs opacity-80 truncate max-w-[200px]">{todayRecord.dadMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* 背景装饰 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {phase === 'first' && (
            <>
              <div className="absolute w-4 h-4 bg-green-300 rounded-full opacity-30 animate-pulse" style={{ top: '10%', left: '20%' }} />
              <div className="absolute w-3 h-3 bg-green-200 rounded-full opacity-40 animate-pulse" style={{ top: '30%', right: '15%' }} />
              <div className="absolute w-5 h-5 bg-green-400 rounded-full opacity-20 animate-pulse" style={{ bottom: '20%', left: '10%' }} />
            </>
          )}
          {phase === 'second' && (
            <>
              <div className="absolute w-16 h-16 bg-orange-200 rounded-full opacity-20 animate-pulse" style={{ top: '10%', left: '30%' }} />
              <div className="absolute w-12 h-12 bg-yellow-200 rounded-full opacity-30 animate-pulse" style={{ top: '40%', right: '20%' }} />
            </>
          )}
          {phase === 'third' && (
            <>
              <div className="absolute w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse" style={{ top: '20%', left: '15%' }} />
              <div className="absolute w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse" style={{ bottom: '30%', right: '25%' }} />
            </>
          )}
        </div>

        {/* 宝宝小名 */}
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {weekInfo.fruit === '大西瓜' ? '🎉' : '🌱'} {userInfo?.babyName}的第{currentWeek}周
          </h2>
          <p className="text-gray-500">
            孕第 {currentWeek} 周第 {currentDay} 天
          </p>
        </div>

        {/* 宝宝状态卡片 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg max-w-md w-full mb-6 relative z-10">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <BabyIllustration weekNumber={currentWeek} size="large" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              宝宝像 {weekInfo.fruit} 一样大啦
            </h3>
            <p className="text-gray-500 text-sm mb-4">{weekInfo.development}</p>
            <p className="text-gray-400 text-xs">{weekInfo.description}</p>
          </div>
        </div>

        {/* 倒计时 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl px-8 py-4 mb-6 relative z-10">
          <p className="text-center text-gray-600">
            距离与宝宝见面还有 <span className="text-2xl font-bold text-pink-500">{daysUntilDue}</span> 天
          </p>
        </div>

        {/* 产检提醒 */}
        {checkCountdown && checkCountdown.daysUntil <= 14 && (
          <div className="bg-pink-100/80 backdrop-blur-sm rounded-2xl px-6 py-4 mb-6 max-w-md w-full relative z-10">
            <p className="text-center text-pink-700">
              📅 {checkCountdown.check.name} - 约{checkCountdown.daysUntil}天后
            </p>
            <p className="text-center text-pink-500 text-sm mt-1">
              {checkCountdown.check.reminderText}
            </p>
          </div>
        )}

        {/* 打卡按钮 */}
        <button
          onClick={() => navigate('/checkin')}
          className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-12 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 relative z-10"
        >
          {todayRecord ? '今日已打卡 ✨' : '开始今日打卡'}
        </button>

        <BottomNav />
      </div>
    );
  }

  // 首次输入页面
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-600 mb-4">🌱 萌芽日记</h1>
          <p className="text-gray-600">记录每一天与宝宝的成长</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="mb-6">
            <label className="block text-gray-600 mb-2 font-medium">预产期是什么时候？</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:outline-none"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-gray-600 mb-2 font-medium">给宝宝起个小名吧</label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              placeholder="比如：小芽芽、小桃子、小豆子..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-400 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-400 to-emerald-400 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            开始记录旅程 🌱
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          我们会记住每一个与宝宝有关的日子
        </p>
      </div>
    </div>
  );
}
