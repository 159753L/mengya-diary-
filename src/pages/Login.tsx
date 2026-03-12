import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { checkPhoneExists, getUserInfoFromSupabase } from '../lib/supabase';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUserId, setUserInfo } = useApp();

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('请输入手机号和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 检查本地是否已注册（优先检查本地，因为可能 Supabase 不可用）
      const localRegistered = localStorage.getItem(`registered_${phone}`) === 'true';
      const storedPassword = localStorage.getItem(`password_${phone}`);
      const hasLocalData = localStorage.getItem(`user_${phone}`);

      // 检查云端用户是否存在
      const phoneExists = await checkPhoneExists(phone);

      // 情况1：本地有注册记录 = 老用户，需要验证密码
      if (localRegistered && hasLocalData) {
        // 验证密码
        if (storedPassword !== password) {
          setError('手机号或密码错误');
          setLoading(false);
          return;
        }

        // 密码验证成功，登录成功
        const userInfo = JSON.parse(hasLocalData);
        localStorage.setItem('userId', phone);
        localStorage.setItem('loginTime', Date.now().toString());
        setUserInfo({
          babyName: userInfo.babyName,
          dueDate: userInfo.dueDate,
          createdAt: Date.now()
        });
        localStorage.setItem('userInfo', JSON.stringify({
          babyName: userInfo.babyName,
          dueDate: userInfo.dueDate,
          createdAt: Date.now()
        }));
        localStorage.setItem('hasSetBabyInfo', 'true');
        setUserId(phone);
        setLoading(false);
        navigate('/checkin');
        return;
      }

      // 情况2：本地没有注册记录，但云端有注册记录 = 老用户首次在这个设备登录
      if (phoneExists && (!localRegistered || !hasLocalData)) {
        // 尝试从云端验证密码并获取用户信息
        const result = await getUserInfoFromSupabase(phone, password);

        if (result.success && result.userInfo) {
          // 云端验证成功，保存到本地
          localStorage.setItem('userId', phone);
          localStorage.setItem('loginTime', Date.now().toString());
          localStorage.setItem(`registered_${phone}`, 'true');
          localStorage.setItem(`password_${phone}`, password);
          localStorage.setItem(`user_${phone}`, JSON.stringify(result.userInfo));

          setUserInfo({
            babyName: result.userInfo.babyName,
            dueDate: result.userInfo.dueDate,
            createdAt: Date.now()
          });
          localStorage.setItem('userInfo', JSON.stringify({
            babyName: result.userInfo.babyName,
            dueDate: result.userInfo.dueDate,
            createdAt: Date.now()
          }));
          localStorage.setItem('hasSetBabyInfo', 'true');
          setUserId(phone);
          setLoading(false);
          navigate('/checkin');
          return;
        } else {
          // 云端验证失败（密码错误或无法连接）
          setError('手机号或密码错误');
          setLoading(false);
          return;
        }
      }

      // 情况3：本地和云端都没有注册记录 = 新用户
      // 新用户需要先注册（设置密码和宝宝信息），跳转到注册页面
      localStorage.setItem('userId', phone);
      localStorage.setItem('tempPhone', phone); // 保存手机号到注册页面
      localStorage.setItem('tempPassword', password);

      setUserId(phone);
      setLoading(false);
      navigate('/setup');
      return;
    } catch (err) {
      console.error('登录失败:', err);
      setError('登录失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 flex flex-col">
      {/* 顶部装饰 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Logo/图标 */}
        <div className="text-6xl mb-6">🌱</div>
        <h1 className="text-3xl font-bold text-gray-700 mb-2">萌芽日记</h1>
        <p className="text-gray-500 mb-8">记录你和宝宝的成长每一天</p>

        {/* 登录表单 */}
        <div className="w-full max-w-xs space-y-4">
          {/* 手机号输入 */}
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:outline-none text-center"
            />
          </div>

          {/* 密码输入 */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-300 focus:outline-none text-center"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-center text-red-400 text-sm">{error}</p>
          )}

          {/* 登录按钮 */}
          <button
            onClick={handleLogin}
            disabled={loading || !phone || !password}
            className="w-full py-3 bg-gradient-to-r from-pink-400 to-purple-400 text-white rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          {/* 提示 */}
          <p className="text-center text-xs text-gray-400 mt-4">
            新用户会自动跳转到设置页面
          </p>
        </div>
      </div>
    </div>
  );
}
