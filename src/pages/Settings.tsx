import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { clearAllData } from '../lib/storage';
import BottomNav from '../components/BottomNav';
import { getNotificationPermission } from '../components/PushNotification';

export default function Settings() {
  const navigate = useNavigate();
  const { userInfo, setUserInfo, phase } = useApp();

  const [dueDate, setDueDate] = useState(userInfo?.dueDate || '');
  const [babyName, setBabyName] = useState(userInfo?.babyName || '');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');

  useEffect(() => {
    setNotifPermission(getNotificationPermission());
  }, []);

  const requestNotifPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        new Notification('🌱 萌芽日记', {
          body: '推送通知已开启！'
        });
      }
    }
  };

  const handleSave = () => {
    if (!dueDate || !babyName) return;

    const userInfoData = {
      dueDate,
      babyName,
      createdAt: userInfo?.createdAt || Date.now(),
    };

    // 保存到App Context
    setUserInfo(userInfoData);

    // 保存到用户关联的存储（同一手机号再次登录可读取）
    const userId = localStorage.getItem('userId');
    if (userId) {
      localStorage.setItem(`user_${userId}`, JSON.stringify(userInfoData));
    }

    alert('保存成功！');
  };

  const handleClear = () => {
    clearAllData();
    window.location.href = '/';
  };

  if (!userInfo) {
    navigate('/');
    return null;
  }

  return (
    <div
      className="min-h-screen p-6 pb-20"
      data-theme={phase === 'first' ? '' : phase === 'second' ? 'second' : 'third'}
      style={{
        background: `linear-gradient(180deg, var(--theme-bg) 0%, var(--theme-primary) 100%)`,
      }}
    >
      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-700">⚙️ 设置</h1>
      </div>

      {/* 宝宝信息 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md mb-4 max-w-sm mx-auto">
        <h3 className="font-bold text-gray-700 mb-4">宝宝信息</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm mb-2">预产期</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-2">宝宝小名</label>
            <input
              type="text"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:outline-none"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-medium"
          >
            保存修改
          </button>
        </div>
      </div>

      {/* 通知设置 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md mb-4 max-w-sm mx-auto">
        <h3 className="font-bold text-gray-700 mb-4">🔔 通知提醒</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">推送通知</span>
            <span className={`text-xs px-2 py-1 rounded ${
              notifPermission === 'granted' ? 'bg-green-100 text-green-600' :
              notifPermission === 'denied' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {notifPermission === 'granted' ? '已开启' :
               notifPermission === 'denied' ? '已关闭' : '未设置'}
            </span>
          </div>

          {notifPermission !== 'granted' && (
            <button
              onClick={requestNotifPermission}
              className="w-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white py-2 rounded-xl font-medium"
            >
              开启打卡提醒 🔔
            </button>
          )}

          {notifPermission === 'granted' && (
            <button
              onClick={() => {
                new Notification('🌱 萌芽日记', {
                  body: '测试通知：记得今天也要记录和宝宝的美好时光哦！'
                });
              }}
              className="w-full bg-purple-100 text-purple-600 py-2 rounded-xl font-medium text-sm"
            >
              测试通知
            </button>
          )}

          <p className="text-gray-400 text-xs">
            开启后，打卡日和产检前会收到提醒
          </p>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md mb-4 max-w-sm mx-auto">
        <h3 className="font-bold text-gray-700 mb-4">关于</h3>

        <div className="text-center text-gray-500">
          <p className="text-lg font-bold mb-2">🌱 萌芽日记</p>
          <p className="text-sm">记录每一天与宝宝的成长</p>
          <p className="text-xs mt-2">Version 1.0</p>
        </div>

        {/* 分享应用 */}
        <button
          onClick={async () => {
            try {
              if (navigator.share) {
                await navigator.share({
                  title: '萌芽日记',
                  text: '记录宝宝成长的孕期日记应用',
                  url: window.location.origin,
                });
              } else {
                await navigator.clipboard.writeText(window.location.origin);
                alert('应用链接已复制！');
              }
            } catch (err) {
              console.log('分享取消');
            }
          }}
          className="w-full mt-4 bg-gradient-to-r from-pink-400 to-rose-400 text-white py-2 rounded-xl font-medium"
        >
          分享给朋友 📤
        </button>
      </div>

      {/* 退出登录 */}
      <button
        onClick={() => {
          if (confirm('确定要退出登录吗？')) {
            // 只清除登录状态，保留用户数据（手机号关联的宝宝信息）
            localStorage.removeItem('userId');
            localStorage.removeItem('loginTime');
            window.location.href = '/login';
          }
        }}
        className="w-full mt-4 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium max-w-sm mx-auto block"
      >
        退出登录 🚪
      </button>

      {/* 危险区域 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md max-w-sm mx-auto">
        <h3 className="font-bold text-red-500 mb-4">危险操作</h3>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="w-full bg-red-50 text-red-500 py-3 rounded-xl font-medium"
        >
          清空所有数据 🗑️
        </button>
      </div>

      <BottomNav />

      {/* 确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-6">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full">
            <h3 className="text-lg font-bold text-center mb-4">确认清空？</h3>
            <p className="text-gray-500 text-center mb-6">
              此操作不可恢复，所有记录将被删除
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-medium"
              >
                取消
              </button>
              <button
                onClick={handleClear}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
