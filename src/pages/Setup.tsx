import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { saveUserInfoToSupabase, checkPhoneExists } from '../lib/supabase';

export default function Setup() {
  const [babyName, setBabyName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserInfo, setUserId } = useApp();

  // 检查是否从登录页面跳转过来
  useEffect(() => {
    const tempPhone = localStorage.getItem('tempPhone');
    const tempPassword = localStorage.getItem('tempPassword');

    if (!tempPhone || !tempPassword) {
      // 没有临时信息，可能是直接访问，跳转到登录
      navigate('/login');
      return;
    }

    // 检查手机号是否已被注册
    const checkRegistration = async () => {
      const exists = await checkPhoneExists(tempPhone);
      if (exists) {
        // 手机号已被注册，跳回登录
        setError('该手机号已被注册，请直接登录');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };
    checkRegistration();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!babyName || !dueDate) return;

    setLoading(true);

    // 获取注册时传递的手机号
    const userId = localStorage.getItem('tempPhone') || localStorage.getItem('userId');
    // 获取临时保存的密码
    const tempPassword = localStorage.getItem('tempPassword');

    // 保存宝宝信息到localStorage（关联到用户ID）
    const userInfo = {
      babyName,
      dueDate,
      createdAt: Date.now()
    };

    // 用用户ID作为key存储
    if (userId) {
      localStorage.setItem(`user_${userId}`, JSON.stringify(userInfo));
      localStorage.setItem('userId', userId); // 保存全局用户ID
    }

    // 同时保存到全局
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    localStorage.setItem('hasSetBabyInfo', 'true');

    // 保存到App Context
    setUserInfo(userInfo);
    if (userId) setUserId(userId);

    // 清除临时密码和手机号
    localStorage.removeItem('tempPassword');
    localStorage.removeItem('tempPhone');

    // 记录用户已注册（用于本地验证）
    if (userId) {
      localStorage.setItem(`registered_${userId}`, 'true');
      // 保存密码到本地（用于离线验证）
      if (tempPassword) {
        localStorage.setItem(`password_${userId}`, tempPassword);
      }
    }

    // 同步到Supabase（包含密码）
    try {
      await saveUserInfoToSupabase({
        babyName,
        dueDate,
        password: tempPassword || undefined
      });
    } catch (e) {
      console.error('同步到云端失败:', e);
    }

    setLoading(false);

    // 跳转到打卡页
    navigate('/checkin');
  };

  // 计算默认预产期（今天+280天）
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 280);
    return date.toISOString().split('T')[0];
  };

  // 获取注册手机号显示
  const registerPhone = localStorage.getItem('tempPhone') || '';

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col p-6">
      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-center mb-4">
          {error}
        </div>
      )}

      {/* 标题 */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-700">注册新账号</h1>
        <p className="text-gray-500 mt-2">手机号: {registerPhone}</p>
      </div>

      {/* 表单 */}
      <div className="flex-1 max-w-xs mx-auto w-full space-y-6">
        {/* 宝宝小名 */}
        <div>
          <label className="block text-gray-600 mb-2">宝宝小名</label>
          <input
            type="text"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="给小名取个名字吧"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:outline-none text-center"
          />
        </div>

        {/* 预产期 */}
        <div>
          <label className="block text-gray-600 mb-2">预产期</label>
          <input
            type="date"
            value={dueDate || getDefaultDueDate()}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:outline-none text-center"
          />
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={loading || !babyName || !dueDate}
          className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl font-medium disabled:opacity-50 mt-8"
        >
          {loading ? '保存中...' : '开始记录'}
        </button>
      </div>
    </div>
  );
}
